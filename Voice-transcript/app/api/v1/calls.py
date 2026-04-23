from fastapi import APIRouter, Request, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from uuid import UUID
from typing import Optional

from fastapi import BackgroundTasks
from datetime import datetime
from app.services.transcibe_service import TranscribeService
from app.services.roll_service import RollService
from app.services.twilio_service import TwilioService
from app.services.call_service import CallService
from app.services.inbound_call_service import (
    handle_inbound_voice,
    handle_inbound_status,
    process_inbound_background,
)
from app.database import get_session
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.core.twilio_signature import verify_twilio_signature
from app.models.base import User, Call, InboundCallNotification, UnknownInbound

router = APIRouter(prefix="/calls", tags=["Calls"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class StartCallRequest(BaseModel):
    lead_id: UUID
    campaign_id: UUID


class RollRequest(BaseModel):
    campaign_id: UUID


# =============================================================================
# AGENT ENDPOINTS
# =============================================================================

@router.post("/start", status_code=201, summary="Start a call linked to a lead and campaign")
async def start_call(
    payload: StartCallRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await CallService.start_call(
        db=db,
        lead_id=payload.lead_id,
        campaign_id=payload.campaign_id,
        current_user=current_user,
    )


@router.post("/token", summary="Generate Twilio Access Token for browser calling")
async def get_access_token(
    current_user: User = Depends(get_current_user),
):
    twilio_service = TwilioService()
    return twilio_service.generate_access_token(
        agent_identity=str(current_user.user_id)
    )


# =============================================================================
# INBOUND-CALL LISTING / NOTIFICATIONS
# Must sit above the `/{call_id}` catch-all below — otherwise FastAPI would try
# to parse "inbound-notifications" as a UUID and return 422.
# =============================================================================

class InboundNotificationItem(BaseModel):
    notification_id: UUID
    kind: str
    caller_display: str
    campaign_name: Optional[str] = None
    lead_id: Optional[UUID] = None
    call_id: Optional[UUID] = None
    unknown_id: Optional[UUID] = None
    created_at: datetime
    read_at: Optional[datetime] = None


class InboundNotificationsResponse(BaseModel):
    unread_count: int
    items: list[InboundNotificationItem]


class UnknownInboundItem(BaseModel):
    unknown_id: UUID
    caller_phone: Optional[str] = None
    caller_phone_domestic: Optional[str] = None
    to_phone: str
    received_at: datetime
    call_duration_sec: Optional[int] = None
    outcome: Optional[str] = None
    converted_to_lead_id: Optional[UUID] = None


@router.get(
    "/inbound-notifications",
    response_model=InboundNotificationsResponse,
    summary="List in-app notifications for inbound calls for the current user",
)
async def list_inbound_notifications(
    unread_only: bool = False,
    limit: int = 50,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    limit = max(1, min(limit, 200))

    stmt = select(InboundCallNotification).where(
        InboundCallNotification.user_id == current_user.user_id,
        InboundCallNotification.org_id == current_user.org_id,
    )
    if unread_only:
        stmt = stmt.where(InboundCallNotification.read_at.is_(None))
    stmt = stmt.order_by(InboundCallNotification.created_at.desc()).limit(limit)

    rows = (await db.execute(stmt)).scalars().all()

    unread_count_stmt = select(InboundCallNotification).where(
        InboundCallNotification.user_id == current_user.user_id,
        InboundCallNotification.org_id == current_user.org_id,
        InboundCallNotification.read_at.is_(None),
    )
    unread_count = len((await db.execute(unread_count_stmt)).scalars().all())

    return InboundNotificationsResponse(
        unread_count=unread_count,
        items=[
            InboundNotificationItem(
                notification_id=n.notification_id,
                kind=n.kind,
                caller_display=n.caller_display,
                campaign_name=n.campaign_name,
                lead_id=n.lead_id,
                call_id=n.call_id,
                unknown_id=n.unknown_id,
                created_at=n.created_at,
                read_at=n.read_at,
            )
            for n in rows
        ],
    )


@router.post(
    "/inbound-notifications/{notification_id}/read",
    summary="Mark an inbound-call notification as read",
)
async def mark_inbound_notification_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from fastapi import HTTPException

    result = await db.execute(
        select(InboundCallNotification).where(
            InboundCallNotification.notification_id == notification_id,
            InboundCallNotification.user_id == current_user.user_id,
            InboundCallNotification.org_id == current_user.org_id,
        )
    )
    notif = result.scalars().first()
    if notif is None:
        raise HTTPException(status_code=404, detail="Notification not found.")

    if notif.read_at is None:
        notif.read_at = datetime.utcnow()
        await db.commit()

    return {"notification_id": str(notification_id), "read_at": notif.read_at}


@router.post(
    "/inbound-notifications/mark-all-read",
    summary="Mark all inbound-call notifications as read for the current user",
)
async def mark_all_inbound_notifications_read(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import update as sql_update

    now = datetime.utcnow()
    await db.execute(
        sql_update(InboundCallNotification)
        .where(
            InboundCallNotification.user_id == current_user.user_id,
            InboundCallNotification.org_id == current_user.org_id,
            InboundCallNotification.read_at.is_(None),
        )
        .values(read_at=now)
    )
    await db.commit()
    return {"status": "ok", "read_at": now}


@router.delete(
    "/inbound-notifications/{notification_id}",
    summary="Dismiss (delete) a single inbound-call notification",
)
async def delete_inbound_notification(
    notification_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from fastapi import HTTPException
    from sqlalchemy import delete as sql_delete

    result = await db.execute(
        select(InboundCallNotification).where(
            InboundCallNotification.notification_id == notification_id,
            InboundCallNotification.user_id == current_user.user_id,
            InboundCallNotification.org_id == current_user.org_id,
        )
    )
    notif = result.scalars().first()
    if notif is None:
        raise HTTPException(status_code=404, detail="Notification not found.")

    await db.execute(
        sql_delete(InboundCallNotification).where(
            InboundCallNotification.notification_id == notification_id,
            InboundCallNotification.user_id == current_user.user_id,
        )
    )
    await db.commit()
    return {"status": "deleted", "notification_id": str(notification_id)}


@router.delete(
    "/inbound-notifications",
    summary="Clear inbound-call notifications for the current user (read_only=true clears only read ones)",
)
async def clear_inbound_notifications(
    read_only: bool = False,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import delete as sql_delete

    stmt = sql_delete(InboundCallNotification).where(
        InboundCallNotification.user_id == current_user.user_id,
        InboundCallNotification.org_id == current_user.org_id,
    )
    if read_only:
        stmt = stmt.where(InboundCallNotification.read_at.is_not(None))

    await db.execute(stmt)
    await db.commit()
    return {"status": "cleared"}


@router.get(
    "/unknown-inbounds",
    response_model=list[UnknownInboundItem],
    summary="List unknown-caller inbound calls for the current org",
)
async def list_unknown_inbounds(
    include_converted: bool = False,
    limit: int = 100,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    limit = max(1, min(limit, 500))

    stmt = select(UnknownInbound).where(UnknownInbound.org_id == current_user.org_id)
    if not include_converted:
        stmt = stmt.where(UnknownInbound.converted_to_lead_id.is_(None))
    stmt = stmt.order_by(UnknownInbound.received_at.desc()).limit(limit)

    rows = (await db.execute(stmt)).scalars().all()
    return [
        UnknownInboundItem(
            unknown_id=r.unknown_id,
            caller_phone=r.caller_phone,
            caller_phone_domestic=r.caller_phone_domestic,
            to_phone=r.to_phone,
            received_at=r.received_at,
            call_duration_sec=r.call_duration_sec,
            outcome=r.outcome,
            converted_to_lead_id=r.converted_to_lead_id,
        )
        for r in rows
    ]


@router.get("/{call_id}", summary="Get call status + transcription from DB")
async def get_call_status(
    call_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await CallService.get_call_status(
        db=db,
        call_id=call_id,
        current_user=current_user,
    )


# =============================================================================
# TWILIO WEBHOOKS
# =============================================================================

@router.post(
    "/inbound-voice",
    summary="Twilio webhook — inbound call arrives, returns greeting TwiML",
    dependencies=[Depends(verify_twilio_signature)],
)
async def inbound_voice(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_session),
):
    """Twilio "A call comes in" webhook for inbound numbers owned by an org.

    Returns a short TwiML `<Say>...<Hangup/>` rendered from the org's greeting
    config, and queues a background task to match the caller to a lead, promote
    the lead to the top of the queue, and fan out notifications.
    """
    form_data = await request.form()
    form_dict = {k: v for k, v in form_data.multi_items()}
    twiml = await handle_inbound_voice(db, form_dict)

    call_sid = form_dict.get("CallSid")
    to_phone = form_dict.get("To") or ""
    from_phone = form_dict.get("From") or ""
    if call_sid:
        background_tasks.add_task(
            process_inbound_background,
            call_sid=call_sid,
            to_phone=to_phone,
            from_phone=from_phone,
            started_at=datetime.utcnow(),
        )

    return Response(content=twiml, media_type="application/xml")


@router.post(
    "/inbound-status",
    summary="Twilio webhook — inbound call status callback (duration/outcome)",
    dependencies=[Depends(verify_twilio_signature)],
)
async def inbound_status(
    request: Request,
    db: AsyncSession = Depends(get_session),
):
    """Twilio statusCallback for inbound calls — fires at completed/no-answer/busy/failed.

    Updates the Call or UnknownInbound row with the final outcome + duration.
    Returns an empty TwiML `<Response/>`.
    """
    form_data = await request.form()
    form_dict = {k: v for k, v in form_data.multi_items()}
    twiml = await handle_inbound_status(db, form_dict)
    return Response(content=twiml, media_type="application/xml")


@router.post("/voice", summary="Twilio webhook — TwiML for single production calls")
async def voice_handler(
    request: Request,
    call_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_session),
):
    from app.models.base import User as UserModel

    form_data = await request.form()
    to_number = form_data.get("To")
    call_sid = form_data.get("CallSid")

    print(f"📞 Voice handler: CallSid={call_sid}, To={to_number}, call_id={call_id}")

    # ── Single production call — call_id exists ───────────────────
    if call_id:
        try:
            existing_result = await db.execute(
                select(Call).where(Call.call_id == call_id)
            )
            existing_call = existing_result.scalars().first()
            if existing_call and not existing_call.twilio_sid:
                existing_call.twilio_sid = call_sid
                await db.commit()
        except Exception as e:
            print(f"⚠️ Could not update call record: {e}")

        recording_callback = f"{settings.BASE_URL}/api/v1/calls/recording-webhook?call_id={call_id}"
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Record
                maxLength="3600"
                playBeep="false"
                recordingStatusCallback="{recording_callback}"
                recordingStatusCallbackMethod="POST"
            />
        </Response>"""
        return Response(content=twiml, media_type="application/xml")

    # ── Browser test call — no call_id ────────────────────────────
    if not call_id and call_sid:
        try:
            existing_result = await db.execute(
                select(Call).where(Call.twilio_sid == call_sid)
            )
            existing_call = existing_result.scalars().first()

            if existing_call:
                call_id = existing_call.call_id
            else:
                user_result = await db.execute(select(UserModel).limit(1))
                user = user_result.scalars().first()
                if user:
                    new_call = Call(
                        org_id=user.org_id,
                        user_id=user.user_id,
                        destination=to_number,
                        twilio_sid=call_sid,
                        direction="outbound",
                        status="in_progress",
                    )
                    db.add(new_call)
                    await db.commit()
                    await db.refresh(new_call)
                    call_id = new_call.call_id
                    print(f"✅ Created Call record for browser call: {call_id}")
        except Exception as e:
            print(f"⚠️ Could not create Call record: {type(e).__name__}: {e}")

    if call_id:
        recording_callback = f"{settings.BASE_URL}/api/v1/calls/recording-webhook?call_id={call_id}"
    else:
        recording_callback = f"{settings.BASE_URL}/api/v1/calls/recording-webhook?twilio_sid={call_sid}"

    if not to_number:
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Record
                maxLength="3600"
                playBeep="false"
                recordingStatusCallback="{recording_callback}"
                recordingStatusCallbackMethod="POST"
            />
        </Response>"""
    else:
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Dial record="record-from-answer"
                  recordingStatusCallback="{recording_callback}"
                  recordingStatusCallbackMethod="POST"
                  callerId="{settings.FROM_NUMBER}">
                <Number>{to_number}</Number>
            </Dial>
        </Response>"""

    return Response(content=twiml, media_type="application/xml")


@router.post("/conference-agent", summary="Twilio webhook — Agent leg joins conference")
async def conference_agent(
    request: Request,
    conf: Optional[str] = None,
    call_id: Optional[UUID] = None,
):
    """
    Agent browser leg TwiML.
    Agent joins the conference first and waits for lead.
    startConferenceOnEnter=true → conference starts when agent joins.
    endConferenceOnExit=true → conference ends when agent leaves.
    """
    print(f"🎙 Agent joining conference: {conf}")

    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Dial>
            <Conference
                startConferenceOnEnter="true"
                endConferenceOnExit="true"
                beep="false"
                record="record-from-start"
                recordingStatusCallback="{settings.BASE_URL}/api/v1/calls/recording-webhook?call_id={call_id}"
                recordingStatusCallbackMethod="POST">
                {conf}
            </Conference>
        </Dial>
    </Response>"""

    return Response(content=twiml, media_type="application/xml")


@router.post("/conference-lead", summary="Twilio webhook — Lead leg joins conference")
async def conference_lead(
    request: Request,
    conf: Optional[str] = None,
    call_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_session),
):
    """
    Lead phone leg TwiML.
    Lead joins after agent is already in the conference.
    startConferenceOnEnter=false → lead waits for agent.
    endConferenceOnExit=true → conference ends when lead hangs up.
    """
    form_data = await request.form()
    call_sid = form_data.get("CallSid")

    print(f"📞 Lead joining conference: {conf}, CallSid={call_sid}")

    # Update twilio_sid on call record
    if call_id and call_sid:
        try:
            result = await db.execute(select(Call).where(Call.call_id == call_id))
            existing_call = result.scalars().first()
            if existing_call and not existing_call.twilio_sid:
                existing_call.twilio_sid = call_sid
                await db.commit()
        except Exception as e:
            print(f"⚠️ Could not update call: {e}")

    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Dial>
            <Conference
                startConferenceOnEnter="false"
                endConferenceOnExit="true"
                beep="false">
                {conf}
            </Conference>
        </Dial>
    </Response>"""

    return Response(content=twiml, media_type="application/xml")


@router.post("/webhook", summary="Twilio webhook — updates call status in DB")
async def call_webhook(
    request: Request,
    call_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_session),
):
    form_data = dict(await request.form())
    if call_id:
        form_data["internal_call_id"] = str(call_id)
    return await CallService.handle_webhook(db=db, form_data=form_data)


@router.post("/recording-webhook", summary="Twilio webhook — downloads MP3, triggers transcription")
async def recording_webhook(
    request: Request,
    background_tasks: BackgroundTasks,          # ← add this
    call_id: Optional[UUID] = None,
    twilio_sid: Optional[str] = None,
    db: AsyncSession = Depends(get_session),
):
    form_data = dict(await request.form())
    if call_id:
        form_data["internal_call_id"] = str(call_id)

    result = await CallService.handle_recording_webhook(
        db=db,
        form_data=form_data,
        call_id=call_id,
    )

    # ── Launch background task if transcription job was started ───
    if result.get("transcription_job") and result.get("call_id"):
        background_tasks.add_task(
            TranscribeService.process_transcript_background,
            call_id=result["call_id"],
            job_name=result["transcription_job"],
        )
        print(f"🚀 Background task launched for call_id={result['call_id']}")

    return result


@router.post("/{call_id}/hangup", summary="Hang up an active call — terminates both conference legs")
async def hangup_call(
    call_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from app.integrations.twilio_client import TwilioClient

    result = await db.execute(
        select(Call).where(Call.call_id == call_id, Call.org_id == current_user.org_id)
    )
    call = result.scalars().first()
    if not call:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Call not found.")

    twilio = TwilioClient()

    # Terminate every active call leg in the conference. Conference name uses
    # a different prefix for manual vs. roll calls — try both so hangup works
    # regardless of how the call was started.
    call_id_hex = str(call_id).replace('-', '')
    prefix = "roll_" if getattr(call, "is_roll", False) else "manual_"
    conf_name = f"{prefix}{call_id_hex}"
    try:
        conferences = twilio.client.conferences.list(friendly_name=conf_name, status="in-progress")
        for conf in conferences:
            for participant in twilio.client.conferences(conf.sid).participants.list():
                twilio.client.conferences(conf.sid).participants(participant.call_sid).update(
                    status="completed"
                )
            print(f"✅ Conference {conf_name} terminated")
    except Exception as e:
        print(f"⚠️ Conference terminate error: {e}")

    # Also cancel the call directly by SID as a fallback
    if call.twilio_sid:
        try:
            twilio.client.calls(call.twilio_sid).update(status="completed")
        except Exception as e:
            print(f"⚠️ Direct call terminate error: {e}")

    call.status = "completed"
    await db.commit()

    return {"status": "terminated", "call_id": str(call_id)}


# =============================================================================
# ROLL ENDPOINTS
# =============================================================================

@router.post("/start-roll", status_code=201, summary="Start automatic roll calling")
async def start_roll(
    payload: RollRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await RollService.start_roll(
        db=db,
        campaign_id=payload.campaign_id,
        current_user=current_user,
    )


@router.post("/stop-roll", summary="Stop the active roll")
async def stop_roll(
    payload: RollRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await RollService.stop_roll(
        db=db,
        campaign_id=payload.campaign_id,
        current_user=current_user,
    )


@router.get("/roll-status/{campaign_id}", summary="Get live roll progress")
async def get_roll_status(
    campaign_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await RollService.get_roll_status(
        db=db,
        campaign_id=campaign_id,
        current_user=current_user,
    )


@router.post("/roll/proceed", summary="Agent confirmed status — proceed to next lead")
async def proceed_roll(
    payload: RollRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await RollService.proceed_roll(
        db=db,
        campaign_id=payload.campaign_id,
        current_user=current_user,
    )



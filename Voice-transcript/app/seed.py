import asyncio
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models.base import Organization, User, Contact

async def seed_data():
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # 1. Create Demo Organization
        org = Organization(
            org_id=uuid4(),
            org_name="Acme Voice Corp",
            plan="pro",
            bus_type="Real Estate"
        )
        session.add(org)
        
        # 2. Create Demo User
        user = User(
            user_id=uuid4(),
            org_id=org.org_id,
            email="admin@acme.com",
            hashed_password="fakehashedpassword", # In real life, use passlib
            role="admin"
        )
        session.add(user)
        
        # 3. Create Demo Contact
        contact = Contact(
            contact_id=uuid4(),
            org_id=org.org_id,
            name="John Doe",
            phone_number="+1234567890",
            email="john@doe.com"
        )
        session.add(contact)
        
        await session.commit()
        print(f"✅ Successfully seeded:")
        print(f"   Org: {org.org_name} ({org.org_id})")
        print(f"   User: {user.email}")
        print(f"   Contact: {contact.name}")

if __name__ == "__main__":
    asyncio.run(seed_data())
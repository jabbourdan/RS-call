// ─── Auth Request Models ───────────────────────────────────────────────────────

export interface SignInRequest {
    email: string;
    password: string;
}

// ─── Auth Response Models ──────────────────────────────────────────────────────

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user_id: string;
    org_id: string;
    role: UserRole;
}

export interface RefreshTokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

// ─── Current User Model ────────────────────────────────────────────────────────

export interface CurrentUser {
    user_id: string;
    org_id: string;
    email: string;
    full_name: string;
    role: UserRole;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
}

// ─── Role Types ────────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

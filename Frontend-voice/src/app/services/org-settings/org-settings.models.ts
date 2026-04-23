export interface OrgSettings {
    org_id: string;
    org_name: string;
    plan: string;
    bus_type: string | null;
    max_phone_numbers: number;
    num_agents: number;
}

export interface OrgSettingsUpdate {
    org_name?: string;
    bus_type?: string | null;
    max_phone_numbers?: number;
}

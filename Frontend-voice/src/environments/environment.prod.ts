export const environment = {
    production: true,
    apiUrl: 'https://api.kolligent.co.il/api/v1',
    twilioEnabled: true,
    pollingIntervalMs: 4000,       // roll status polling (4 seconds)
    tokenRefreshBufferMs: 60000,   // refresh JWT 60s before expiry in prod
    logLevel: 'error' as const,
    campaignSecondaryFieldsEnabled: false,
    adminWhatsAppNumber: '+972509444706',
};

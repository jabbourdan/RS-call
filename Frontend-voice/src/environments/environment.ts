export const environment = {
    production: false,
    apiUrl: '/api/v1',  // proxied via proxy.conf.json → http://localhost:8000
    twilioEnabled: true,
    pollingIntervalMs: 4000,       // roll status polling (4 seconds)
    tokenRefreshBufferMs: 30000,   // refresh JWT 30s before expiry
    logLevel: 'debug' as const,
    campaignSecondaryFieldsEnabled: false,
};

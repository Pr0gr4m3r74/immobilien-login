window.CONFIG = Object.freeze({
  DEMO_MODE: true,
  SESSION_TIMEOUT_MS: 30 * 60 * 1000,
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_COOLDOWN_MS: 30 * 1000,
  LOGIN_THROTTLE_MS: 1000,
  credentials: Object.freeze({
    customerHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
    adminHash: 'c1c224b03cd9bc7b6a86d77f5dace40191766c485cd55dc48caf9ac873335d6f'
  }),
  branding: Object.freeze({
    appName: 'Private Immobilienplattform',
    companyName: 'Private Real Estate Suite',
    loginTitle: 'Interner Zugang Immobilienplattform',
    loginDescription: 'Geschützter Zugriff auf Immobilien, Exposés und Verwaltungsfunktionen – ausschließlich für berechtigte Nutzer.',
    dashboardTitle: 'Internes Immobilien-Dashboard'
  }),
  storageKeys: Object.freeze({
    theme: 'immobilien-theme',
    language: 'immobilien-language',
    properties: 'immobilien-properties',
    access: 'access',
    role: 'role',
    credentialHash: 'credentialHash'
  })
});

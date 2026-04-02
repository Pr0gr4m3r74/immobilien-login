/**
 * ============================================================
 *  Zentrale Konfiguration – Immobilien-Portal (Demo)
 * ============================================================
 *
 *  HINWEIS: Dies ist eine reine DEMO-Anwendung.
 *  In einer Produktionsumgebung würden Passwort-Hashes,
 *  Session-Einstellungen und andere sensible Werte über
 *  Umgebungsvariablen oder ein sicheres Backend bezogen.
 *
 *  Bitte KEINE echten Zugangsdaten hier eintragen!
 * ============================================================
 */

window.CONFIG = Object.freeze({

  // ── Demo-Modus ──────────────────────────────────────────
  // Wenn true, werden die unten definierten Demo-Hashes verwendet.
  // In Produktion: false – Authentifizierung läuft über das Backend.
  DEMO_MODE: true,

  // ── Demo-Zugangsdaten (nur SHA-256-Hashes) ─────────────
  // ACHTUNG: Nur für Demonstrationszwecke!
  // In Produktion kommen diese Werte NICHT ins Frontend.
  credentials: Object.freeze({
    // Demo-Passwort für Kunden: "1234"
    customerHash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    // Demo-Passwort für Admins: "Admin"
    adminHash:    "c1c224b03cd9bc7b6a86d77f5dace40191766c485cd55dc48caf9ac873335d6f"
  }),

  // ── Session-Einstellungen ───────────────────────────────
  // Timeout in Millisekunden (30 Minuten)
  SESSION_TIMEOUT_MS: 30 * 60 * 1000,

  // ── Login-Schutz ────────────────────────────────────────
  // Maximale Fehlversuche, bevor eine Abkühlzeit greift
  MAX_LOGIN_ATTEMPTS: 5,
  // Abkühlzeit in Millisekunden nach Erreichen des Limits
  LOGIN_COOLDOWN_MS: 30 * 1000,
  // Mindestabstand zwischen zwei Login-Versuchen (ms)
  LOGIN_THROTTLE_MS: 1000,

  // ── App-Name & Branding ─────────────────────────────────
  branding: Object.freeze({
    appName:    "Immobilien Portal",
    pageTitle:  "Exklusive Wohnungsangebote",
    loginTitle: "Willkommen bei Immobilien Login",
    companyName: "Immobilien Demo GmbH"
  }),

  // ── Platzhalter-Bilder ──────────────────────────────────
  // Werden angezeigt, wenn keine echten Fotos hinterlegt sind.
  placeholderImages: Object.freeze({
    width:  1200,
    height: 720,
    bgColor:   "#4F46E5",
    textColor: "#F9FAFB",
    fallbackText: "Kein Bild vorhanden"
  })
});

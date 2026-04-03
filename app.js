(function () {
  const CFG = window.CONFIG;
  const STORAGE = CFG.storageKeys;

  function expectedHashForRole(role) {
    return role === 'admin' ? ADMIN_HASH : role === 'customer' ? PASS_HASH : null;
  }

  function getSession() {
    return {
      access: Number(sessionStorage.getItem(STORAGE.access) || 0),
      role: sessionStorage.getItem(STORAGE.role),
      credentialHash: sessionStorage.getItem(STORAGE.credentialHash)
    };
  }

  function hasValidSession() {
    const session = getSession();
    const expectedHash = expectedHashForRole(session.role);
    return Boolean(
      session.access &&
      expectedHash &&
      session.credentialHash === expectedHash &&
      Date.now() - session.access <= CFG.SESSION_TIMEOUT_MS
    );
  }

  function startSession(role, credentialHash) {
    sessionStorage.setItem(STORAGE.role, role);
    sessionStorage.setItem(STORAGE.credentialHash, credentialHash);
    sessionStorage.setItem(STORAGE.access, String(Date.now()));
  }

  function clearSession() {
    sessionStorage.removeItem(STORAGE.access);
    sessionStorage.removeItem(STORAGE.role);
    sessionStorage.removeItem(STORAGE.credentialHash);
  }

  function requireSession() {
    if (!hasValidSession()) {
      clearSession();
      return false;
    }
    touchSession();
    return true;
  }

  function touchSession() {
    if (!sessionStorage.getItem(STORAGE.role)) return;
    sessionStorage.setItem(STORAGE.access, String(Date.now()));
  }

  function bindSessionActivity() {
    let lastTouch = 0;
    const handler = () => {
      const now = Date.now();
      if (now - lastTouch < 1000) return;
      lastTouch = now;
      touchSession();
    };
    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach((eventName) => {
      window.addEventListener(eventName, handler, { passive: true });
    });
  }

  function getRole() {
    return sessionStorage.getItem(STORAGE.role);
  }

  function isAdmin() {
    return getRole() === 'admin';
  }

  function redirectIfAuthenticated() {
    if (hasValidSession()) {
      window.location.replace('geheim.html');
      return true;
    }
    return false;
  }

  function logout() {
    clearSession();
    window.location.replace('index.html');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatCurrency(amount, language) {
    const locale = language === 'en' ? 'en-GB' : 'de-DE';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(Number(amount || 0));
  }

  window.App = {
    config: CFG,
    storage: STORAGE,
    expectedHashForRole,
    getSession,
    hasValidSession,
    startSession,
    clearSession,
    requireSession,
    touchSession,
    bindSessionActivity,
    getRole,
    isAdmin,
    redirectIfAuthenticated,
    logout,
    escapeHtml,
    formatCurrency
  };
})();

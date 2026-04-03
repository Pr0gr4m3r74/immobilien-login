const PASS_HASH = window.CONFIG.credentials.customerHash;
const ADMIN_HASH = window.CONFIG.credentials.adminHash;

window.Auth = (() => {
  const SESSION_KEY = 'access';
  const ROLE_KEY = 'role';
  const HASH_KEY = 'credentialHash';

  async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password || '');
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  function createSession(role, credentialHash) {
    sessionStorage.setItem(SESSION_KEY, String(Date.now()));
    sessionStorage.setItem(ROLE_KEY, role);
    sessionStorage.setItem(HASH_KEY, credentialHash);
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem(HASH_KEY);
  }

  function getRole() {
    return sessionStorage.getItem(ROLE_KEY);
  }

  function getSessionInfo() {
    const loginTime = Number.parseInt(sessionStorage.getItem(SESSION_KEY), 10);
    const credentialHash = sessionStorage.getItem(HASH_KEY);
    const role = getRole();
    const validCustomer = role === 'customer' && credentialHash === PASS_HASH;
    const validAdmin = role === 'admin' && credentialHash === ADMIN_HASH;
    const active = Boolean(loginTime)
      && Date.now() - loginTime <= window.CONFIG.SESSION_TIMEOUT_MS
      && (validCustomer || validAdmin);

    return {
      active,
      role,
      loginTime,
      isAdmin: validAdmin,
      isCustomer: validCustomer
    };
  }

  function touchSession() {
    if (getSessionInfo().active) {
      sessionStorage.setItem(SESSION_KEY, String(Date.now()));
    }
  }

  function requireSession() {
    const session = getSessionInfo();
    if (!session.active) {
      clearSession();
      return false;
    }
    return session;
  }

  return {
    hashPassword,
    createSession,
    clearSession,
    getRole,
    getSessionInfo,
    touchSession,
    requireSession
  };
})();

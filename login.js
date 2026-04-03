(function () {
  async function hashPassword(password) {
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    return Array.from(new Uint8Array(buffer)).map((item) => item.toString(16).padStart(2, '0')).join('');
  }

  function updateThemeButton() {
    const button = document.querySelector('[data-theme-toggle]');
    if (!button || !window.I18n) return;
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const label = button.querySelector('[data-theme-label]');
    if (label) label.textContent = theme === 'dark' ? I18n.t('common.lightMode') : I18n.t('common.darkMode');
  }

  function updateFooter() {
    const footer = document.getElementById('loginFooter');
    if (!footer) return;
    footer.textContent = `© ${new Date().getFullYear()} ${window.CONFIG.branding.companyName}`;
  }

  function showMessage(text, type) {
    const box = document.getElementById('msgBox');
    box.textContent = text;
    box.className = `message-box${type ? ` is-${type}` : ''}`;
  }

  function clearMessage() {
    showMessage('', '');
  }

  document.addEventListener('DOMContentLoaded', async () => {
    if (window.App.redirectIfAuthenticated()) return;

    Theme.initTheme();
    await I18n.init();
    updateThemeButton();
    updateFooter();

    const cfg = window.CONFIG;
    const brand = document.getElementById('brandTitle');
    const ribbon = document.getElementById('demoRibbon');
    const demoInfo = document.getElementById('demoInfo');
    const passwordInput = document.getElementById('pw');
    const toggleButton = document.getElementById('togglePw');
    const form = document.getElementById('loginForm');
    const adminButton = document.getElementById('btnAdmin');

    if (brand) brand.textContent = cfg.branding.appName;
    if (cfg.DEMO_MODE) {
      ribbon.hidden = false;
      demoInfo.hidden = false;
    }

    let failedAttempts = 0;
    let lastTry = 0;
    let cooldownUntil = 0;
    let cooldownTimer = null;

    function setPasswordVisible(isVisible) {
      passwordInput.type = isVisible ? 'text' : 'password';
      toggleButton.textContent = isVisible ? '◉' : '◎';
      toggleButton.setAttribute('aria-label', I18n.t(isVisible ? 'login.hidePassword' : 'login.showPassword'));
    }

    function updateCooldownDisplay() {
      const remaining = Math.max(0, cooldownUntil - Date.now());
      if (remaining <= 0) {
        clearInterval(cooldownTimer);
        cooldownTimer = null;
        failedAttempts = 0;
        clearMessage();
        return;
      }
      showMessage(I18n.t('login.cooldown', { seconds: Math.ceil(remaining / 1000) }), 'warning');
    }

    function startCooldown() {
      cooldownUntil = Date.now() + cfg.LOGIN_COOLDOWN_MS;
      updateCooldownDisplay();
      cooldownTimer = setInterval(updateCooldownDisplay, 1000);
    }

    async function login(role) {
      if (cooldownUntil > Date.now()) {
        updateCooldownDisplay();
        return;
      }

      const now = Date.now();
      if (now - lastTry < cfg.LOGIN_THROTTLE_MS) {
        showMessage(I18n.t('login.wait'), 'error');
        return;
      }
      lastTry = now;
      passwordInput.classList.remove('input-error');
      clearMessage();

      const value = passwordInput.value.trim();
      if (!value) {
        passwordInput.classList.add('input-error');
        showMessage(I18n.t('login.enterPassword'), 'error');
        passwordInput.focus();
        return;
      }

      const hashed = await hashPassword(value);
      const expectedHash = role === 'admin' ? ADMIN_HASH : PASS_HASH;

      if (hashed === expectedHash) {
        showMessage(I18n.t('login.success'), 'success');
        App.startSession(role, hashed);
        window.setTimeout(() => {
          window.location.href = 'geheim.html';
        }, 500);
        return;
      }

      failedAttempts += 1;
      passwordInput.classList.add('input-error');
      if (failedAttempts >= cfg.MAX_LOGIN_ATTEMPTS) {
        startCooldown();
      } else {
        showMessage(I18n.t('login.wrongPassword', { attempts: cfg.MAX_LOGIN_ATTEMPTS - failedAttempts }), 'error');
      }
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      login('customer');
    });

    adminButton.addEventListener('click', () => {
      login('admin');
    });

    toggleButton.addEventListener('click', () => {
      setPasswordVisible(passwordInput.type === 'password');
    });

    passwordInput.addEventListener('input', () => {
      passwordInput.classList.remove('input-error');
      if (!cooldownTimer) clearMessage();
    });

    document.addEventListener('themechange', updateThemeButton);
    document.addEventListener('languagechange', () => {
      updateThemeButton();
      setPasswordVisible(passwordInput.type === 'text');
    });
  });
})();

(function () {
  const KEY = window.CONFIG.storageKeys.theme;

  function resolveTheme(theme) {
    if (theme === 'light' || theme === 'dark') return theme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getStoredTheme() {
    return localStorage.getItem(KEY);
  }

  function applyTheme(theme) {
    const nextTheme = resolveTheme(theme || getStoredTheme());
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem(KEY, nextTheme);
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: nextTheme } }));
    return nextTheme;
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || resolveTheme(getStoredTheme());
    return applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function initTheme() {
    applyTheme(getStoredTheme());
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      if (button.dataset.themeBound === 'true') return;
      button.dataset.themeBound = 'true';
      button.addEventListener('click', () => {
        toggleTheme();
      });
    });
  }

  window.Theme = {
    getStoredTheme,
    applyTheme,
    toggleTheme,
    initTheme
  };

  applyTheme(getStoredTheme());
})();

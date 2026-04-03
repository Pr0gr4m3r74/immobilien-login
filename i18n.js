(function () {
  const KEY = window.CONFIG.storageKeys.language;
  const DEFAULT_LANGUAGE = 'de';
  let dictionary = null;
  let currentLanguage = localStorage.getItem(KEY) || DEFAULT_LANGUAGE;

  function deepGet(source, path) {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), source);
  }

  async function load() {
    if (dictionary) return dictionary;
    const response = await fetch('translations.json', { cache: 'no-store' });
    dictionary = await response.json();
    return dictionary;
  }

  function t(key, variables) {
    const langPack = dictionary?.[currentLanguage] || {};
    const fallbackPack = dictionary?.[DEFAULT_LANGUAGE] || {};
    let message = deepGet(langPack, key);
    if (message === undefined) message = deepGet(fallbackPack, key);
    if (typeof message !== 'string') return key;
    return message.replace(/\{(\w+)\}/g, (_, token) => {
      return variables && variables[token] !== undefined ? String(variables[token]) : `{${token}}`;
    });
  }

  function apply(root) {
    const target = root || document;
    document.documentElement.lang = currentLanguage;

    target.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });

    target.querySelectorAll('[data-i18n-text]').forEach((node) => {
      node.textContent = t(node.dataset.i18nText);
    });

    target.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      node.setAttribute('placeholder', t(node.dataset.i18nPlaceholder));
    });

    target.querySelectorAll('[data-i18n-title]').forEach((node) => {
      node.setAttribute('title', t(node.dataset.i18nTitle));
    });

    target.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
      node.setAttribute('aria-label', t(node.dataset.i18nAriaLabel));
    });

    target.querySelectorAll('[data-language-select]').forEach((select) => {
      select.value = currentLanguage;
      if (select.dataset.languageBound === 'true') return;
      select.dataset.languageBound = 'true';
      select.addEventListener('change', async (event) => {
        await setLanguage(event.target.value);
      });
    });

    document.dispatchEvent(new CustomEvent('languagechange', { detail: { language: currentLanguage } }));
  }

  async function setLanguage(language) {
    await load();
    currentLanguage = dictionary[language] ? language : DEFAULT_LANGUAGE;
    localStorage.setItem(KEY, currentLanguage);
    apply(document);
    return currentLanguage;
  }

  async function init() {
    await load();
    currentLanguage = dictionary[currentLanguage] ? currentLanguage : DEFAULT_LANGUAGE;
    apply(document);
    return currentLanguage;
  }

  function getLanguage() {
    return currentLanguage;
  }

  window.I18n = {
    init,
    load,
    apply,
    setLanguage,
    getLanguage,
    t
  };
})();

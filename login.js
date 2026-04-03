(() => {
  const CFG = window.CONFIG;
  const { App, Auth, PropertyStore } = window;

  let failedAttempts = 0;
  let lastTry = 0;
  let cooldownUntil = 0;
  let cooldownTimer = null;

  function updateFooter() {
    const footer = document.getElementById('loginFooter');
    if (!footer) return;
    footer.textContent = App.t('loginFooter', {
      year: String(new Date().getFullYear()),
      location: CFG.branding.location
    });
  }

  function populateQuickSearchCities(properties) {
    const select = document.getElementById('quickSearchCity');
    if (!select) return;
    const current = select.value;
    select.innerHTML = `<option value="">${App.t('quickSearchCityPlaceholder')}</option>`;
    PropertyStore.getCities(properties).forEach((city) => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      select.appendChild(option);
    });
    select.value = current;
  }

  function renderFeatured(properties) {
    const grid = document.getElementById('featuredGrid');
    if (!grid) return;
    grid.innerHTML = '';
    properties.slice(0, 3).forEach((property) => {
      const card = document.createElement('article');
      card.className = 'listing-card';
      card.innerHTML = `
        <div class="listing-card__media">
          <img src="${property.images[0]}" alt="${property.title}">
          <span class="status-chip status-chip--${property.status}">${App.t(`cardStatus${property.status.charAt(0).toUpperCase() + property.status.slice(1)}`)}</span>
        </div>
        <div class="listing-card__body">
          <div class="listing-card__head">
            <div>
              <p class="listing-card__eyebrow">${property.city}</p>
              <h3>${property.title}</h3>
            </div>
            ${property.featured ? `<span class="featured-badge">${App.t('cardFeatured')}</span>` : ''}
          </div>
          <p class="listing-card__text">${property.description}</p>
          <div class="listing-card__meta">
            <span>${App.formatCurrency(property.price)}</span>
            <span>${App.formatNumber(property.area)} m²</span>
            <span>${property.rooms}</span>
          </div>
        </div>`;
      grid.appendChild(card);
    });
  }

  function runQuickSearch(event) {
    event.preventDefault();
    const query = document.getElementById('quickSearchQuery').value.trim();
    const city = document.getElementById('quickSearchCity').value;
    const status = document.getElementById('quickSearchStatus').value;
    Auth.createSession('customer', PASS_HASH);
    sessionStorage.setItem('portalFilters', JSON.stringify({ query, city, status, category: '', minPrice: '', maxPrice: '', sort: 'latest' }));
    window.location.href = 'geheim.html';
  }

  function showMessage(key, vars = {}, type = '') {
    const box = document.getElementById('msgBox');
    if (!box) return;
    box.textContent = App.t(key, vars);
    box.className = `message-box ${type}`.trim();
  }

  function clearMessage() {
    const box = document.getElementById('msgBox');
    if (!box) return;
    box.textContent = '';
    box.className = 'message-box';
  }

  function setInputError(active) {
    const input = document.getElementById('accessPassword');
    if (!input) return;
    input.classList.toggle('is-invalid', Boolean(active));
  }

  function updateCooldownDisplay() {
    const remaining = Math.max(0, cooldownUntil - Date.now());
    if (!remaining) {
      window.clearInterval(cooldownTimer);
      cooldownTimer = null;
      failedAttempts = 0;
      clearMessage();
      return;
    }
    showMessage('loginCooldown', { count: String(Math.ceil(remaining / 1000)) }, 'is-warning');
  }

  function startCooldown() {
    cooldownUntil = Date.now() + CFG.LOGIN_COOLDOWN_MS;
    updateCooldownDisplay();
    cooldownTimer = window.setInterval(updateCooldownDisplay, 1000);
  }

  async function login(role) {
    clearMessage();
    setInputError(false);

    if (cooldownUntil > Date.now()) {
      updateCooldownDisplay();
      return;
    }

    const now = Date.now();
    if (now - lastTry < CFG.LOGIN_THROTTLE_MS) {
      showMessage('loginThrottle', {}, 'is-error');
      return;
    }
    lastTry = now;

    const input = document.getElementById('accessPassword');
    const value = input.value.trim();
    if (!value) {
      setInputError(true);
      showMessage('loginEmpty', {}, 'is-error');
      input.focus();
      return;
    }

    const hash = await Auth.hashPassword(value);
    const target = role === 'admin' ? ADMIN_HASH : PASS_HASH;
    if (hash === target) {
      showMessage('loginSuccess', {}, 'is-success');
      Auth.createSession(role, hash);
      window.setTimeout(() => {
        window.location.href = 'geheim.html';
      }, 450);
      return;
    }

    failedAttempts += 1;
    setInputError(true);
    if (failedAttempts >= CFG.MAX_LOGIN_ATTEMPTS) {
      startCooldown();
      return;
    }
    showMessage('loginFail', { count: String(CFG.MAX_LOGIN_ATTEMPTS - failedAttempts) }, 'is-error');
  }

  function bindLogin() {
    const password = document.getElementById('accessPassword');
    document.getElementById('customerLogin').addEventListener('click', () => login('customer'));
    document.getElementById('adminLogin').addEventListener('click', () => login('admin'));
    document.getElementById('quickSearchForm').addEventListener('submit', runQuickSearch);
    password.addEventListener('input', () => {
      setInputError(false);
      if (!cooldownTimer) clearMessage();
    });
  }

  function localiseComputed() {
    updateFooter();
    const properties = PropertyStore.read();
    const stats = PropertyStore.stats(properties);
    document.getElementById('heroStatOneValue').textContent = App.formatNumber(stats.total);
    document.getElementById('heroStatTwoValue').textContent = App.formatNumber(stats.cities);
    document.getElementById('heroStatThreeValue').textContent = App.getLanguage() === 'de' ? '21 Tage' : '21 days';
    renderFeatured(properties.filter((property) => property.status !== 'draft'));
    populateQuickSearchCities(properties);
  }

  document.addEventListener('DOMContentLoaded', () => {
    App.translateDocument();
    const updateControls = App.initControls();
    bindLogin();
    localiseComputed();
    window.addEventListener('app:languagechange', () => {
      App.translateDocument();
      updateControls();
      localiseComputed();
    });
    window.addEventListener('app:themechange', () => updateControls());
  });
})();

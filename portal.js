(function () {
  const state = {
    properties: [],
    filters: {
      query: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      rooms: ''
    },
    activePropertyId: null,
    activeImageIndex: 0,
    editingId: null,
    formImages: []
  };

  const dom = {};

  function t(key, variables) {
    return window.I18n.t(key, variables);
  }

  function currentLanguage() {
    return window.I18n.getLanguage();
  }

  function getPriceLabel(property) {
    return property.priceValue ? App.formatCurrency(property.priceValue, currentLanguage()) : t('portal.priceOnRequest');
  }

  function getLocationLabel(property) {
    return [property.city, property.address].filter(Boolean).join(' · ');
  }

  function getTypeLabel(property) {
    return t(`propertyType.${property.typeKey}`);
  }

  function getStatusLabel(property) {
    return t(`propertyStatus.${property.statusKey}`);
  }

  function getActiveProperty() {
    return state.properties.find((property) => property.id === state.activePropertyId) || null;
  }

  function updateThemeButton() {
    const button = dom.themeToggle;
    if (!button) return;
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const label = button.querySelector('[data-theme-label]');
    if (label) label.textContent = theme === 'dark' ? t('common.lightMode') : t('common.darkMode');
  }

  function updateRoleBadge() {
    dom.roleBadge.textContent = App.isAdmin() ? t('portal.adminView') : t('portal.customerView');
    dom.roleBadge.classList.toggle('is-admin', App.isAdmin());
  }

  function updateQuickAction() {
    dom.quickAction.hidden = !App.isAdmin();
  }

  function updateAdminVisibility() {
    document.querySelectorAll('.admin-only').forEach((node) => {
      node.hidden = !App.isAdmin();
    });
  }

  function refreshSummary() {
    const total = state.properties.length;
    const filtered = getFilteredProperties().length;
    const cities = new Set(state.properties.map((property) => property.city).filter(Boolean));

    dom.statTotalValue.textContent = String(total);
    dom.statVisibleValue.textContent = String(filtered);
    dom.statCitiesValue.textContent = String(cities.size);
    dom.resultsInfo.textContent = t('portal.searchResults', { count: filtered });
  }

  function populateCitySuggestions() {
    const cities = [...new Set(state.properties.map((property) => property.city).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    dom.citySuggestions.innerHTML = cities.map((city) => `<option value="${App.escapeHtml(city)}"></option>`).join('');
  }

  function resetFilters() {
    state.filters = { query: '', city: '', minPrice: '', maxPrice: '', rooms: '' };
    dom.searchInput.value = '';
    dom.cityInput.value = '';
    dom.minPriceInput.value = '';
    dom.maxPriceInput.value = '';
    dom.roomsInput.value = '';
    renderProperties();
  }

  function syncFiltersFromForm() {
    state.filters.query = dom.searchInput.value.trim().toLowerCase();
    state.filters.city = dom.cityInput.value.trim().toLowerCase();
    state.filters.minPrice = Number(dom.minPriceInput.value || 0);
    state.filters.maxPrice = Number(dom.maxPriceInput.value || 0);
    state.filters.rooms = Number(dom.roomsInput.value || 0);
  }

  function getFilteredProperties() {
    return state.properties.filter((property) => {
      const haystack = `${property.title} ${property.city} ${property.address} ${property.descriptionText}`.toLowerCase();
      if (state.filters.query && !haystack.includes(state.filters.query)) return false;
      if (state.filters.city && !property.city.toLowerCase().includes(state.filters.city)) return false;
      if (state.filters.minPrice && property.priceValue < state.filters.minPrice) return false;
      if (state.filters.maxPrice && property.priceValue > state.filters.maxPrice) return false;
      if (state.filters.rooms && property.rooms < state.filters.rooms) return false;
      return true;
    });
  }

  function createPropertyCard(property) {
    const card = document.createElement('article');
    card.className = 'property-card';
    card.innerHTML = `
      <div class="property-card__media">
        <img src="${App.escapeHtml(property.images[0])}" alt="${App.escapeHtml(property.title)}">
        <span class="status-badge">${App.escapeHtml(getStatusLabel(property))}</span>
      </div>
      <div class="property-card__content">
        <div class="property-card__topline">${App.escapeHtml(getTypeLabel(property))}</div>
        <h3>${App.escapeHtml(property.title)}</h3>
        <p class="property-card__location">${App.escapeHtml(getLocationLabel(property))}</p>
        <p class="property-card__price">${App.escapeHtml(getPriceLabel(property))}</p>
        <div class="property-card__facts">
          <span>${property.rooms || '–'} ${App.escapeHtml(t('portal.roomsShort'))}</span>
          <span>${property.area || '–'} m²</span>
        </div>
        <p class="property-card__description">${App.escapeHtml(property.descriptionText || '')}</p>
        <div class="property-card__actions">
          <button type="button" class="button button--ghost" data-action="details">${App.escapeHtml(t('common.details'))}</button>
          ${App.isAdmin() ? `<button type="button" class="button button--secondary" data-action="edit">${App.escapeHtml(t('common.edit'))}</button><button type="button" class="button button--danger" data-action="delete">${App.escapeHtml(t('common.delete'))}</button>` : ''}
        </div>
      </div>
    `;

    card.querySelector('[data-action="details"]').addEventListener('click', () => openProperty(property.id));
    if (App.isAdmin()) {
      card.querySelector('[data-action="edit"]').addEventListener('click', () => startEdit(property.id));
      card.querySelector('[data-action="delete"]').addEventListener('click', () => removeProperty(property.id));
    }
    return card;
  }

  function renderProperties() {
    syncFiltersFromForm();
    const filtered = getFilteredProperties();
    dom.propertyGrid.innerHTML = '';

    if (!filtered.length) {
      dom.propertyGrid.innerHTML = `<div class="empty-state"><h3>${App.escapeHtml(t('portal.emptyTitle'))}</h3><p>${App.escapeHtml(t('portal.emptyText'))}</p></div>`;
      refreshSummary();
      return;
    }

    filtered.forEach((property) => {
      dom.propertyGrid.appendChild(createPropertyCard(property));
    });
    refreshSummary();
  }

  function renderModal() {
    const property = getActiveProperty();
    if (!property) return;
    const currentImage = property.images[state.activeImageIndex] || property.images[0];
    dom.modalTitle.textContent = property.title;
    dom.modalLocation.textContent = getLocationLabel(property);
    dom.modalPrice.textContent = getPriceLabel(property);
    dom.modalStatus.textContent = getStatusLabel(property);
    dom.modalImage.src = currentImage;
    dom.modalImage.alt = property.title;
    dom.modalDescription.innerHTML = property.descriptionHtml;
    dom.modalFacts.innerHTML = `
      <li><strong>${App.escapeHtml(t('portal.factType'))}</strong><span>${App.escapeHtml(getTypeLabel(property))}</span></li>
      <li><strong>${App.escapeHtml(t('portal.factRooms'))}</strong><span>${property.rooms || '–'}</span></li>
      <li><strong>${App.escapeHtml(t('portal.factArea'))}</strong><span>${property.area ? `${property.area} m²` : '–'}</span></li>
      <li><strong>${App.escapeHtml(t('portal.factCity'))}</strong><span>${App.escapeHtml(property.city || '–')}</span></li>
    `;
    dom.modalFeatures.innerHTML = property.features.length
      ? property.features.map((feature) => `<li>${App.escapeHtml(feature)}</li>`).join('')
      : `<li>${App.escapeHtml(t('portal.noFeatures'))}</li>`;
    dom.modalThumbs.innerHTML = property.images
      .map((image, index) => `<button type="button" class="thumb-button${index === state.activeImageIndex ? ' is-active' : ''}" data-index="${index}"><img src="${App.escapeHtml(image)}" alt="${App.escapeHtml(property.title)}"></button>`)
      .join('');
    dom.modalThumbs.querySelectorAll('[data-index]').forEach((button) => {
      button.addEventListener('click', () => {
        state.activeImageIndex = Number(button.dataset.index);
        renderModal();
      });
    });
  }

  function openProperty(propertyId) {
    state.activePropertyId = propertyId;
    state.activeImageIndex = 0;
    renderModal();
    dom.modal.hidden = false;
    document.body.classList.add('has-modal');
  }

  function closeProperty() {
    dom.modal.hidden = true;
    document.body.classList.remove('has-modal');
  }

  function changeImage(step) {
    const property = getActiveProperty();
    if (!property) return;
    state.activeImageIndex = (state.activeImageIndex + step + property.images.length) % property.images.length;
    renderModal();
  }

  function renderImagePreview() {
    dom.imagePreview.innerHTML = '';
    if (!state.formImages.length) {
      dom.imagePreview.innerHTML = `<p class="hint-text">${App.escapeHtml(t('portal.noImagesSelected'))}</p>`;
      return;
    }
    state.formImages.forEach((image, index) => {
      const card = document.createElement('div');
      card.className = 'preview-card';
      card.innerHTML = `
        <img src="${App.escapeHtml(image)}" alt="Preview ${index + 1}">
        <div class="preview-card__actions">
          <button type="button" class="button button--ghost button--icon" data-action="left" ${index === 0 ? 'disabled' : ''}>←</button>
          <button type="button" class="button button--ghost button--icon" data-action="right" ${index === state.formImages.length - 1 ? 'disabled' : ''}>→</button>
          <button type="button" class="button button--danger button--icon" data-action="delete">×</button>
        </div>
      `;
      card.querySelector('[data-action="left"]').addEventListener('click', () => moveImage(index, -1));
      card.querySelector('[data-action="right"]').addEventListener('click', () => moveImage(index, 1));
      card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteImage(index));
      dom.imagePreview.appendChild(card);
    });
  }

  function moveImage(index, step) {
    const nextIndex = index + step;
    if (nextIndex < 0 || nextIndex >= state.formImages.length) return;
    const items = [...state.formImages];
    const [image] = items.splice(index, 1);
    items.splice(nextIndex, 0, image);
    state.formImages = items;
    renderImagePreview();
  }

  function deleteImage(index) {
    state.formImages = state.formImages.filter((_, itemIndex) => itemIndex !== index);
    renderImagePreview();
  }

  function resetForm() {
    state.editingId = null;
    state.formImages = [];
    dom.propertyForm.reset();
    dom.editor.innerHTML = '';
    dom.formSubmit.textContent = t('common.createProperty');
    dom.formCancel.hidden = true;
    dom.formFeedback.textContent = '';
    renderImagePreview();
  }

  function startEdit(propertyId) {
    const property = state.properties.find((item) => item.id === propertyId);
    if (!property) return;
    state.editingId = property.id;
    dom.fieldTitle.value = property.title;
    dom.fieldCity.value = property.city;
    dom.fieldAddress.value = property.address;
    dom.fieldPrice.value = property.priceValue || '';
    dom.fieldRooms.value = property.rooms || '';
    dom.fieldArea.value = property.area || '';
    dom.fieldType.value = property.typeKey;
    dom.fieldStatus.value = property.statusKey;
    dom.fieldFeatures.value = property.features.join(', ');
    dom.editor.innerHTML = property.descriptionHtml;
    dom.fieldImages.value = '';
    dom.fieldFiles.value = '';
    state.formImages = [...property.images];
    dom.formSubmit.textContent = t('common.updateProperty');
    dom.formCancel.hidden = false;
    dom.formFeedback.textContent = t('portal.editingProperty');
    renderImagePreview();
    window.location.hash = 'objekt-erstellen';
  }

  function removeProperty(propertyId) {
    if (!window.confirm(t('portal.confirmDelete'))) return;
    state.properties = state.properties.filter((property) => property.id !== propertyId);
    PropertiesStore.saveProperties(state.properties);
    populateCitySuggestions();
    renderProperties();
  }

  function collectFormImages() {
    const pasted = PropertiesStore.parseImageInput(dom.fieldImages.value);
    return state.formImages.length ? state.formImages : pasted;
  }

  function exportProperties() {
    const payload = JSON.stringify(state.properties, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'immobilien-daten.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function handleFileSelection(files) {
    if (!files.length) return;
    state.formImages = await PropertiesStore.readFilesAsDataUrls(files);
    dom.fieldImages.value = '';
    renderImagePreview();
  }

  function normalizeNewProperty(rawProperty) {
    return PropertiesStore.normalizeProperty(rawProperty);
  }

  async function submitForm(event) {
    event.preventDefault();
    const descriptionHtml = PropertiesStore.sanitizeHtml(dom.editor.innerHTML.trim());
    if (!dom.fieldTitle.value.trim() || !dom.fieldCity.value.trim() || !descriptionHtml) {
      dom.formFeedback.textContent = t('portal.validationError');
      return;
    }

    const property = normalizeNewProperty({
      id: state.editingId || PropertiesStore.createId(),
      title: dom.fieldTitle.value.trim(),
      city: dom.fieldCity.value.trim(),
      address: dom.fieldAddress.value.trim(),
      priceValue: Number(dom.fieldPrice.value || 0),
      rooms: Number(dom.fieldRooms.value || 0),
      area: Number(dom.fieldArea.value || 0),
      typeKey: dom.fieldType.value,
      statusKey: dom.fieldStatus.value,
      features: dom.fieldFeatures.value.split(',').map((item) => item.trim()).filter(Boolean),
      descriptionHtml,
      images: collectFormImages(),
      createdAt: new Date().toISOString()
    });

    const feedbackMessage = state.editingId ? t('portal.updateSuccess') : t('portal.createSuccess');

    if (state.editingId) {
      state.properties = state.properties.map((item) => (item.id === state.editingId ? property : item));
    } else {
      state.properties = [property, ...state.properties];
    }

    PropertiesStore.saveProperties(state.properties);
    populateCitySuggestions();
    resetForm();
    dom.formFeedback.textContent = feedbackMessage;
    renderProperties();
  }

  function bindEditorTools() {
    document.querySelectorAll('[data-editor-cmd]').forEach((button) => {
      button.addEventListener('click', () => {
        dom.editor.focus();
        document.execCommand(button.dataset.editorCmd, false, null);
      });
    });
  }

  function bindNavigation() {
    dom.menuToggle.addEventListener('click', () => {
      dom.navMenu.classList.toggle('is-open');
    });

    dom.navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        dom.navMenu.classList.remove('is-open');
      });
    });
  }

  function bindSearch() {
    dom.searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      renderProperties();
    });
    [dom.searchInput, dom.cityInput, dom.minPriceInput, dom.maxPriceInput, dom.roomsInput].forEach((input) => {
      input.addEventListener('input', renderProperties);
    });
    dom.resetFilters.addEventListener('click', resetFilters);
  }

  function bindModal() {
    dom.modalClose.addEventListener('click', closeProperty);
    dom.modalOverlay.addEventListener('click', (event) => {
      if (event.target === dom.modalOverlay) closeProperty();
    });
    dom.modalPrev.addEventListener('click', () => changeImage(-1));
    dom.modalNext.addEventListener('click', () => changeImage(1));
  }

  function bindForm() {
    if (!App.isAdmin()) return;
    dom.fieldFiles.addEventListener('change', async (event) => {
      try {
        await handleFileSelection(Array.from(event.target.files || []));
      } catch (error) {
        dom.formFeedback.textContent = t('portal.imageLoadError');
      }
    });
    dom.fieldImages.addEventListener('input', () => {
      if (dom.fieldImages.value.trim()) {
        state.formImages = PropertiesStore.parseImageInput(dom.fieldImages.value);
        dom.fieldFiles.value = '';
      } else {
        state.formImages = [];
      }
      renderImagePreview();
    });
    dom.fieldImages.addEventListener('paste', async (event) => {
      const items = Array.from(event.clipboardData?.items || []).filter((item) => item.type && item.type.startsWith('image/'));
      if (!items.length) return;
      event.preventDefault();
      state.formImages = await PropertiesStore.readFilesAsDataUrls(items.map((item) => item.getAsFile()).filter(Boolean));
      dom.fieldFiles.value = '';
      dom.fieldImages.value = '';
      renderImagePreview();
    });
    dom.exportProperties.addEventListener('click', exportProperties);
    dom.propertyForm.addEventListener('submit', submitForm);
    dom.formCancel.addEventListener('click', resetForm);
    dom.quickAction.addEventListener('click', () => {
      window.location.hash = 'objekt-erstellen';
    });
    bindEditorTools();
  }

  function bindUtilityActions() {
    dom.logoutButtons.forEach((button) => button.addEventListener('click', App.logout));
    document.addEventListener('themechange', updateThemeButton);
    document.addEventListener('languagechange', () => {
      updateThemeButton();
      updateRoleBadge();
      if (state.editingId) {
        dom.formSubmit.textContent = t('common.updateProperty');
      } else if (App.isAdmin()) {
        dom.formSubmit.textContent = t('common.createProperty');
      }
      renderProperties();
      if (!dom.modal.hidden) renderModal();
      renderImagePreview();
    });
  }

  function cacheDom() {
    dom.roleBadge = document.getElementById('roleBadge');
    dom.themeToggle = document.getElementById('themeToggle');
    dom.quickAction = document.getElementById('quickAction');
    dom.statTotalValue = document.getElementById('statTotalValue');
    dom.statVisibleValue = document.getElementById('statVisibleValue');
    dom.statCitiesValue = document.getElementById('statCitiesValue');
    dom.searchForm = document.getElementById('searchForm');
    dom.searchInput = document.getElementById('searchInput');
    dom.cityInput = document.getElementById('cityFilter');
    dom.minPriceInput = document.getElementById('minPrice');
    dom.maxPriceInput = document.getElementById('maxPrice');
    dom.roomsInput = document.getElementById('roomsFilter');
    dom.resetFilters = document.getElementById('resetFilters');
    dom.citySuggestions = document.getElementById('citySuggestions');
    dom.resultsInfo = document.getElementById('resultsInfo');
    dom.propertyGrid = document.getElementById('propertyGrid');
    dom.modal = document.getElementById('propertyModal');
    dom.modalOverlay = document.getElementById('propertyModal');
    dom.modalClose = document.getElementById('modalClose');
    dom.modalPrev = document.getElementById('modalPrev');
    dom.modalNext = document.getElementById('modalNext');
    dom.modalTitle = document.getElementById('modalTitle');
    dom.modalLocation = document.getElementById('modalLocation');
    dom.modalPrice = document.getElementById('modalPrice');
    dom.modalStatus = document.getElementById('modalStatus');
    dom.modalImage = document.getElementById('modalImage');
    dom.modalDescription = document.getElementById('modalDescription');
    dom.modalFacts = document.getElementById('modalFacts');
    dom.modalFeatures = document.getElementById('modalFeatures');
    dom.modalThumbs = document.getElementById('modalThumbs');
    dom.navMenu = document.getElementById('navMenu');
    dom.menuToggle = document.getElementById('menuToggle');
    dom.logoutButtons = Array.from(document.querySelectorAll('[data-logout]'));
    dom.propertyForm = document.getElementById('propertyForm');
    dom.editor = document.getElementById('descriptionEditor');
    dom.formSubmit = document.getElementById('formSubmit');
    dom.formCancel = document.getElementById('formCancel');
    dom.formFeedback = document.getElementById('formFeedback');
    dom.exportProperties = document.getElementById('exportProperties');
    dom.fieldTitle = document.getElementById('fieldTitle');
    dom.fieldCity = document.getElementById('fieldCity');
    dom.fieldAddress = document.getElementById('fieldAddress');
    dom.fieldPrice = document.getElementById('fieldPrice');
    dom.fieldRooms = document.getElementById('fieldRooms');
    dom.fieldArea = document.getElementById('fieldArea');
    dom.fieldType = document.getElementById('fieldType');
    dom.fieldStatus = document.getElementById('fieldStatus');
    dom.fieldFeatures = document.getElementById('fieldFeatures');
    dom.fieldImages = document.getElementById('fieldImages');
    dom.fieldFiles = document.getElementById('fieldFiles');
    dom.imagePreview = document.getElementById('imagePreview');
  }

  document.addEventListener('DOMContentLoaded', async () => {
    if (!App.requireSession()) {
      window.location.replace('index.html');
      return;
    }

    Theme.initTheme();
    await I18n.init();
    App.bindSessionActivity();
    cacheDom();
    updateRoleBadge();
    updateThemeButton();
    updateQuickAction();
    updateAdminVisibility();
    bindNavigation();
    bindSearch();
    bindModal();
    bindForm();
    bindUtilityActions();

    state.properties = await PropertiesStore.loadProperties();
    populateCitySuggestions();
    renderProperties();
    renderImagePreview();
    document.documentElement.classList.add('session-ok');
  });
})();

(() => {
  const { App, Auth, PropertyStore } = window;
  const session = Auth.requireSession();

  if (!session) {
    alert(App ? App.t('sessionExpired') : 'Session expired.');
    window.location.href = 'index.html';
    return;
  }

  const state = {
    properties: [],
    filtered: [],
    editingId: null,
    activePropertyId: null,
    activeImageIndex: 0,
    draftImages: []
  };

  let inactivityTimer = null;

  function resetInactivityTimer() {
    window.clearTimeout(inactivityTimer);
    inactivityTimer = window.setTimeout(() => {
      Auth.clearSession();
      alert(App.t('inactiveLocked'));
      window.location.href = 'index.html';
    }, window.CONFIG.SESSION_TIMEOUT_MS);
    Auth.touchSession();
  }

  function bindActivityTracking() {
    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach((eventName) => {
      document.addEventListener(eventName, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer();
  }

  function readStoredFilters() {
    try {
      return JSON.parse(sessionStorage.getItem('portalFilters') || '{}');
    } catch (error) {
      return {};
    }
  }

  function persistFilters(filters) {
    sessionStorage.setItem('portalFilters', JSON.stringify(filters));
  }

  function getStatusLabel(status) {
    return App.t(`cardStatus${status.charAt(0).toUpperCase() + status.slice(1)}`);
  }

  function getCategoryLabel(category) {
    const map = {
      apartment: 'categoryApartment',
      house: 'categoryHouse',
      penthouse: 'categoryPenthouse',
      office: 'categoryOffice'
    };
    return App.t(map[category] || category);
  }

  function fillCitySelect(select, includeAny = true) {
    const current = select.value;
    select.innerHTML = includeAny ? `<option value="">${App.t('filterCityAny')}</option>` : '';
    PropertyStore.getCities(state.properties).forEach((city) => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      select.appendChild(option);
    });
    select.value = current;
  }

  function updateStats() {
    const stats = PropertyStore.stats(state.properties);
    document.getElementById('statTotal').textContent = App.formatNumber(stats.total);
    document.getElementById('statPublished').textContent = App.formatNumber(stats.published);
    document.getElementById('statDraft').textContent = App.formatNumber(stats.draft);
    document.getElementById('statCities').textContent = App.formatNumber(stats.cities);
  }

  function currentFilters() {
    return {
      query: document.getElementById('filterQuery').value.trim(),
      category: document.getElementById('filterCategory').value,
      status: document.getElementById('filterStatus').value,
      city: document.getElementById('filterCity').value,
      minPrice: document.getElementById('filterMinPrice').value,
      maxPrice: document.getElementById('filterMaxPrice').value,
      sort: document.getElementById('filterSort').value
    };
  }

  function renderResultsInfo() {
    document.getElementById('resultsInfo').textContent = App.t('resultsLabel', { count: App.formatNumber(state.filtered.length) });
  }

  function renderCards() {
    const list = document.getElementById('propertyGrid');
    const empty = document.getElementById('emptyState');
    list.innerHTML = '';

    if (!state.filtered.length) {
      empty.hidden = false;
      empty.textContent = App.t('resultsEmpty');
      renderResultsInfo();
      return;
    }

    empty.hidden = true;
    state.filtered.forEach((property) => {
      const card = document.createElement('article');
      card.className = 'property-card';
      card.innerHTML = `
        <div class="property-card__media">
          <img src="${property.images[0] || ''}" alt="${property.title}">
          <div class="property-card__chips">
            <span class="status-chip status-chip--${property.status}">${getStatusLabel(property.status)}</span>
            ${property.featured ? `<span class="featured-badge">${App.t('cardFeatured')}</span>` : ''}
          </div>
        </div>
        <div class="property-card__body">
          <div class="property-card__topline">
            <p>${property.city}</p>
            <span>${getCategoryLabel(property.category)}</span>
          </div>
          <h3>${property.title}</h3>
          <p class="property-card__price">${App.formatCurrency(property.price)}</p>
          <p class="property-card__description">${property.description}</p>
          <div class="property-card__meta">
            <span>${App.t('detailMetaArea', { value: App.formatNumber(property.area) })}</span>
            <span>${App.t('detailMetaRooms', { value: String(property.rooms) })}</span>
            <span>${property.address}</span>
          </div>
          <div class="property-card__actions">
            <button type="button" class="button button--ghost" data-action="details">${App.t('cardActionDetails')}</button>
            ${session.isAdmin ? `<button type="button" class="button button--secondary" data-action="edit">${App.t('cardActionEdit')}</button>
            <button type="button" class="button button--danger" data-action="delete">${App.t('cardActionDelete')}</button>` : ''}
          </div>
        </div>`;

      card.querySelector('[data-action="details"]').addEventListener('click', () => openModal(property.id));
      if (session.isAdmin) {
        card.querySelector('[data-action="edit"]').addEventListener('click', () => startEdit(property.id));
        card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteProperty(property.id));
      }
      list.appendChild(card);
    });
    renderResultsInfo();
  }

  function applyFilters() {
    const filters = currentFilters();
    state.filtered = PropertyStore.filter(state.properties, filters);
    persistFilters(filters);
    renderCards();
  }

  function setFormMode(isEditing) {
    document.getElementById('editingBadge').textContent = isEditing ? App.t('managerEditing') : App.t('managerCreate');
    document.getElementById('submitLabel').textContent = isEditing ? App.t('submitUpdate') : App.t('submitCreate');
    document.getElementById('cancelEdit').hidden = !isEditing;
  }

  function setFeedback(message = '', isError = false) {
    const node = document.getElementById('formFeedback');
    node.textContent = message;
    node.classList.toggle('is-error', Boolean(isError));
  }

  function clearValidation() {
    document.querySelectorAll('[data-error-for]').forEach((node) => {
      node.textContent = '';
    });
    document.querySelectorAll('.is-invalid').forEach((node) => node.classList.remove('is-invalid'));
  }

  function setFieldError(name) {
    const field = document.querySelector(`[name="${name}"]`);
    const error = document.querySelector(`[data-error-for="${name}"]`);
    if (field) field.classList.add('is-invalid');
    if (error) error.textContent = App.t('validationRequired');
  }

  function renderImagePreview() {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    if (!state.draftImages.length) {
      const empty = document.createElement('p');
      empty.className = 'preview-empty';
      empty.textContent = App.t('previewEmpty');
      preview.appendChild(empty);
      return;
    }

    state.draftImages.forEach((image, index) => {
      const safeImage = PropertyStore.sanitizeImage(image);
      if (!safeImage) return;
      const card = document.createElement('div');
      card.className = 'image-preview-card';
      const imageNode = document.createElement('img');
      imageNode.src = safeImage;
      imageNode.alt = `${App.t('previewTitle')} ${index + 1}`;
      card.appendChild(imageNode);

      const actions = document.createElement('div');
      actions.className = 'image-preview-card__actions';

      const leftButton = document.createElement('button');
      leftButton.type = 'button';
      leftButton.className = 'icon-button';
      leftButton.textContent = '←';
      leftButton.disabled = index === 0;
      leftButton.setAttribute('aria-label', App.t('previewMoveLeft'));

      const rightButton = document.createElement('button');
      rightButton.type = 'button';
      rightButton.className = 'icon-button';
      rightButton.textContent = '→';
      rightButton.disabled = index === state.draftImages.length - 1;
      rightButton.setAttribute('aria-label', App.t('previewMoveRight'));

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'icon-button icon-button--danger';
      removeButton.textContent = '×';
      removeButton.setAttribute('aria-label', App.t('previewRemove'));

      actions.append(leftButton, rightButton, removeButton);
      card.appendChild(actions);

      removeButton.addEventListener('click', () => {
        state.draftImages.splice(index, 1);
        renderImagePreview();
      });
      leftButton.addEventListener('click', () => {
        if (index === 0) return;
        [state.draftImages[index - 1], state.draftImages[index]] = [state.draftImages[index], state.draftImages[index - 1]];
        renderImagePreview();
      });
      rightButton.addEventListener('click', () => {
        if (index >= state.draftImages.length - 1) return;
        [state.draftImages[index + 1], state.draftImages[index]] = [state.draftImages[index], state.draftImages[index + 1]];
        renderImagePreview();
      });
      preview.appendChild(card);
    });
  }

  function resetForm() {
    state.editingId = null;
    state.draftImages = [];
    document.getElementById('propertyForm').reset();
    document.getElementById('isFeatured').checked = false;
    clearValidation();
    setFeedback('');
    setFormMode(false);
    renderImagePreview();
  }

  function fillForm(property) {
    document.getElementById('title').value = property.title;
    document.getElementById('description').value = property.description;
    document.getElementById('price').value = String(property.price);
    document.getElementById('address').value = property.address;
    document.getElementById('city').value = property.city;
    document.getElementById('area').value = String(property.area);
    document.getElementById('rooms').value = String(property.rooms);
    document.getElementById('category').value = property.category;
    document.getElementById('status').value = property.status;
    document.getElementById('isFeatured').checked = property.featured;
    state.draftImages = [...property.images];
    renderImagePreview();
  }

  function startEdit(id) {
    const property = PropertyStore.getById(id);
    if (!property) return;
    state.editingId = id;
    fillForm(property);
    setFormMode(true);
    setFeedback('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateForm(data) {
    clearValidation();
    let valid = true;
    const safeImages = state.draftImages.map((image) => PropertyStore.sanitizeImage(image)).filter(Boolean);
    ['title', 'description', 'price', 'address', 'city', 'area', 'rooms'].forEach((field) => {
      if (!String(data[field] ?? '').trim()) {
        valid = false;
        setFieldError(field);
      }
    });
    if (!safeImages.length) {
      valid = false;
      setFeedback(App.t('formErrorImages'), true);
    }
    if (!valid && safeImages.length) {
      setFeedback(App.t('formErrorRequired'), true);
    }
    return valid;
  }

  async function addFiles(files) {
    try {
      const dataUrls = await Promise.all(Array.from(files).map((file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      })));
      state.draftImages.push(...dataUrls.filter(Boolean));
      setFeedback('');
      renderImagePreview();
    } catch (error) {
      setFeedback(App.t('formErrorImages'), true);
    }
  }

  function saveProperty(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (!validateForm(data)) return;

    PropertyStore.upsert({
      id: state.editingId || PropertyStore.createId(),
      title: data.title,
      description: data.description,
      price: Number(data.price),
      address: data.address,
      city: data.city,
      area: Number(data.area),
      rooms: Number(data.rooms),
      category: data.category,
      status: data.status,
      featured: document.getElementById('isFeatured').checked,
      createdAt: state.editingId ? PropertyStore.getById(state.editingId)?.createdAt : new Date().toISOString(),
      images: state.draftImages.map((image) => PropertyStore.sanitizeImage(image)).filter(Boolean)
    });

    const successKey = state.editingId ? 'formSuccessUpdate' : 'formSuccessCreate';
    state.properties = PropertyStore.read();
    fillCitySelect(document.getElementById('filterCity'));
    fillCitySelect(document.getElementById('cityList'), false);
    updateStats();
    applyFilters();
    resetForm();
    setFeedback(App.t(successKey), false);
  }

  function deleteProperty(id) {
    if (!window.confirm(App.t('deleteConfirm'))) return;
    PropertyStore.remove(id);
    state.properties = PropertyStore.read();
    updateStats();
    fillCitySelect(document.getElementById('filterCity'));
    fillCitySelect(document.getElementById('cityList'), false);
    applyFilters();
    if (state.editingId === id) resetForm();
  }

  function openModal(id) {
    state.activePropertyId = id;
    state.activeImageIndex = 0;
    updateModal();
    document.getElementById('detailModal').showModal();
  }

  function updateModal() {
    const property = PropertyStore.getById(state.activePropertyId);
    if (!property) return;
    document.getElementById('modalImage').src = property.images[state.activeImageIndex] || '';
    document.getElementById('modalTitle').textContent = property.title;
    document.getElementById('modalAddress').textContent = `${property.address}, ${property.city}`;
    document.getElementById('modalPrice').textContent = App.formatCurrency(property.price);
    document.getElementById('modalDescription').textContent = property.description;
    document.getElementById('modalMeta').innerHTML = `
      <span>${App.t('detailMetaArea', { value: App.formatNumber(property.area) })}</span>
      <span>${App.t('detailMetaRooms', { value: String(property.rooms) })}</span>
      <span>${App.t('detailMetaCategory', { value: getCategoryLabel(property.category) })}</span>`;

    const thumbs = document.getElementById('modalThumbs');
    thumbs.innerHTML = '';
    property.images.forEach((entry, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `thumb-button${index === state.activeImageIndex ? ' is-active' : ''}`;
      button.innerHTML = `<img src="${entry}" alt="${property.title} ${index + 1}">`;
      button.addEventListener('click', () => {
        state.activeImageIndex = index;
        updateModal();
      });
      thumbs.appendChild(button);
    });
  }

  function applyStoredFilters() {
    const filters = readStoredFilters();
    Object.entries(filters).forEach(([name, value]) => {
      const field = document.getElementById(`filter${name.charAt(0).toUpperCase() + name.slice(1)}`);
      if (field) field.value = value;
    });
  }

  function localiseSession() {
    document.getElementById('workspaceMode').textContent = session.isAdmin ? App.t('dashboardBadgeAdmin') : App.t('dashboardBadgeCustomer');
    document.getElementById('inventorySubline').textContent = session.isAdmin ? App.t('inventoryAdminText') : App.t('inventoryCustomerText');
    document.getElementById('managerCard').hidden = !session.isAdmin;
    document.body.classList.toggle('is-customer', !session.isAdmin);
  }

  function bindEvents() {
    document.getElementById('logoutButton').addEventListener('click', () => {
      Auth.clearSession();
      window.location.href = 'index.html';
    });
    document.getElementById('filterForm').addEventListener('submit', (event) => {
      event.preventDefault();
      applyFilters();
    });
    document.getElementById('resetFilters').addEventListener('click', () => {
      document.getElementById('filterForm').reset();
      applyFilters();
    });
    document.getElementById('propertyForm').addEventListener('submit', saveProperty);
    document.getElementById('cancelEdit').addEventListener('click', resetForm);
    document.getElementById('imageFiles').addEventListener('change', async (event) => {
      if (event.target.files?.length) {
        await addFiles(event.target.files);
        event.target.value = '';
      }
    });
    document.getElementById('prevImage').addEventListener('click', () => {
      const property = PropertyStore.getById(state.activePropertyId);
      if (!property) return;
      state.activeImageIndex = (state.activeImageIndex - 1 + property.images.length) % property.images.length;
      updateModal();
    });
    document.getElementById('nextImage').addEventListener('click', () => {
      const property = PropertyStore.getById(state.activePropertyId);
      if (!property) return;
      state.activeImageIndex = (state.activeImageIndex + 1) % property.images.length;
      updateModal();
    });
    document.getElementById('closeModal').addEventListener('click', () => document.getElementById('detailModal').close());
  }

  function init() {
    App.translateDocument();
    const updateControls = App.initControls();
    bindActivityTracking();
    state.properties = PropertyStore.read();
    fillCitySelect(document.getElementById('filterCity'));
    fillCitySelect(document.getElementById('cityList'), false);
    applyStoredFilters();
    localiseSession();
    updateStats();
    applyFilters();
    setFormMode(false);
    renderImagePreview();
    bindEvents();

    window.addEventListener('app:languagechange', () => {
      App.translateDocument();
      updateControls();
      localiseSession();
      updateStats();
      fillCitySelect(document.getElementById('filterCity'));
      fillCitySelect(document.getElementById('cityList'), false);
      applyStoredFilters();
      applyFilters();
      setFormMode(Boolean(state.editingId));
      renderImagePreview();
      if (state.activePropertyId) updateModal();
    });
    window.addEventListener('app:themechange', () => updateControls());
  }

  document.addEventListener('DOMContentLoaded', init);
})();

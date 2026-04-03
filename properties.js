(function () {
  const STORAGE_KEY = window.CONFIG.storageKeys.properties;
  const ALLOWED_TAGS = new Set(['b', 'strong', 'i', 'em', 'u', 'br', 'p', 'ul', 'ol', 'li', 'h3', 'h4']);

  function makePlaceholder(text, startColor, endColor, textColor) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='${startColor}'/><stop offset='100%' stop-color='${endColor}'/></linearGradient></defs><rect width='1600' height='900' rx='40' fill='url(#g)'/><text x='50%' y='52%' fill='${textColor}' font-family='Inter,Arial' font-size='72' text-anchor='middle' dominant-baseline='middle'>${text}</text></svg>`)}`;
  }

  const PLACEHOLDERS = [
    makePlaceholder('Residence', '#1D4ED8', '#0F172A', '#F8FAFC'),
    makePlaceholder('Gallery', '#B45309', '#FACC15', '#111827'),
    makePlaceholder('Property', '#0F766E', '#164E63', '#ECFEFF')
  ];

  function createId() {
    if (window.crypto && crypto.randomUUID) return `prop-${crypto.randomUUID()}`;
    return `prop-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function sanitizeHtml(input) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${input || ''}</div>`, 'text/html');

    const cleanNode = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const tag = child.tagName.toLowerCase();
          if (!ALLOWED_TAGS.has(tag)) {
            child.replaceWith(doc.createTextNode(child.textContent || ''));
            return;
          }
          Array.from(child.attributes).forEach((attr) => child.removeAttribute(attr.name));
          cleanNode(child);
        }
      });
    };

    cleanNode(doc.body);
    return doc.body.innerHTML.trim();
  }

  function htmlToText(html) {
    const container = document.createElement('div');
    container.innerHTML = html || '';
    return (container.textContent || '').trim();
  }

  function parseImageInput(value) {
    if (!value) return [];
    return String(value)
      .split(/\n|,(?=\s*(?:https?:|data:))/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function normalizeImages(input) {
    const list = Array.isArray(input) ? input : parseImageInput(input);
    const cleaned = list.map((item) => String(item || '').trim()).filter(Boolean);
    return cleaned.length ? cleaned : [...PLACEHOLDERS];
  }

  function normalizeProperty(input) {
    const descriptionHtml = sanitizeHtml(
      input.descriptionHtml ||
      String(input.description || '')
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${window.App.escapeHtml(paragraph)}</p>`)
        .join('')
    );

    return {
      id: input.id || createId(),
      title: String(input.title || input.name || 'Objekt'),
      address: String(input.address || ''),
      city: String(input.city || input.address || ''),
      priceValue: Number(input.priceValue || 0),
      rooms: Number(input.rooms || 0),
      area: Number(input.area || 0),
      typeKey: String(input.typeKey || 'apartment'),
      statusKey: String(input.statusKey || 'available'),
      features: Array.isArray(input.features) ? input.features.filter(Boolean) : [],
      descriptionHtml,
      descriptionText: htmlToText(descriptionHtml),
      images: normalizeImages(input.images),
      createdAt: input.createdAt || new Date().toISOString()
    };
  }

  async function loadSeedProperties() {
    const response = await fetch('properties-template.json', { cache: 'no-store' });
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeProperty) : [];
  }

  async function loadProperties() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          return parsed.map(normalizeProperty);
        }
      }
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    }

    const seed = await loadSeedProperties();
    saveProperties(seed);
    return seed;
  }

  function saveProperties(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function readFilesAsDataUrls(files) {
    return Promise.all(
      Array.from(files || []).map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          })
      )
    );
  }

  window.PropertiesStore = {
    PLACEHOLDERS,
    createId,
    sanitizeHtml,
    htmlToText,
    parseImageInput,
    normalizeImages,
    normalizeProperty,
    loadProperties,
    saveProperties,
    readFilesAsDataUrls
  };
})();

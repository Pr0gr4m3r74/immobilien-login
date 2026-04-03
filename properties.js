window.PropertyStore = (() => {
  const STORAGE_KEY = window.CONFIG.STORAGE_KEYS.properties;

  const makeSvg = (title, bgA, bgB, text = '#ffffff') =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bgA}"/><stop offset="100%" stop-color="${bgB}"/></linearGradient></defs><rect width="1280" height="720" rx="40" fill="url(#g)"/><circle cx="1080" cy="120" r="120" fill="rgba(255,255,255,0.08)"/><circle cx="180" cy="560" r="220" fill="rgba(255,255,255,0.06)"/><text x="80" y="590" font-family="Inter, Arial" font-size="72" fill="${text}" opacity="0.94">${title}</text></svg>`)}`;

  const initialProperties = [
    {
      id: 'luma-001',
      title: 'Panorama Penthouse Killesberg',
      description: 'Großzügiges Penthouse mit Dachterrasse, Concierge-Service und maßgeschneiderter Innenausstattung. Ideal für urbane Käufer mit Anspruch an Design und Weitblick.',
      price: 1890000,
      address: 'Am Höhenpark 18',
      city: 'Stuttgart',
      area: 186,
      rooms: 4.5,
      category: 'penthouse',
      status: 'published',
      featured: true,
      createdAt: '2026-03-20T10:00:00.000Z',
      images: [
        makeSvg('Panorama Penthouse', '#1d4ed8', '#312e81'),
        makeSvg('Sky Lounge', '#0f766e', '#164e63'),
        makeSvg('Rooftop View', '#9333ea', '#4c1d95')
      ]
    },
    {
      id: 'luma-002',
      title: 'Townhouse am Englischen Garten',
      description: 'Familienfreundliches Stadthaus mit sechs Zimmern, Gartenlounge und ruhiger Privatstraße. Perfekt für Käufer, die Innenstadt und Rückzugsort kombinieren möchten.',
      price: 2460000,
      address: 'Ifflandstraße 7',
      city: 'München',
      area: 224,
      rooms: 6,
      category: 'house',
      status: 'reserved',
      featured: true,
      createdAt: '2026-03-12T09:30:00.000Z',
      images: [
        makeSvg('Townhouse Garden', '#065f46', '#064e3b'),
        makeSvg('Private Lounge', '#b45309', '#78350f'),
        makeSvg('Living Space', '#1e293b', '#0f172a')
      ]
    },
    {
      id: 'luma-003',
      title: 'Loft Office Medienhafen',
      description: 'Flexible Gewerbefläche mit Empfangszone, Boardroom und Blick auf den Hafen. Konzipiert für Marken, Agenturen und Boutique-Berater.',
      price: 1240000,
      address: 'Harbour Line 5',
      city: 'Düsseldorf',
      area: 312,
      rooms: 8,
      category: 'office',
      status: 'draft',
      featured: false,
      createdAt: '2026-03-28T16:15:00.000Z',
      images: [
        makeSvg('Loft Office', '#0f766e', '#0f172a'),
        makeSvg('Meeting Area', '#ea580c', '#9a3412')
      ]
    },
    {
      id: 'luma-004',
      title: 'Urban Apartment am Spreeufer',
      description: 'Kompaktes Premium-Apartment mit bodentiefen Fenstern, Smart-Home-Paket und direkter Anbindung an die Berliner Kreativquartiere.',
      price: 598000,
      address: 'Uferpromenade 29',
      city: 'Berlin',
      area: 74,
      rooms: 2.5,
      category: 'apartment',
      status: 'published',
      featured: false,
      createdAt: '2026-03-30T08:45:00.000Z',
      images: [
        makeSvg('Urban Apartment', '#2563eb', '#0891b2'),
        makeSvg('Open Living', '#7c3aed', '#4c1d95')
      ]
    }
  ];

  const createId = () => `luma-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  function normalizeProperty(property) {
    return {
      id: property.id || createId(),
      title: String(property.title || '').trim(),
      description: String(property.description || '').trim(),
      price: Number(property.price) || 0,
      address: String(property.address || '').trim(),
      city: String(property.city || '').trim(),
      area: Number(property.area) || 0,
      rooms: Number(property.rooms) || 0,
      category: property.category || 'apartment',
      status: property.status || 'draft',
      featured: Boolean(property.featured),
      createdAt: property.createdAt || new Date().toISOString(),
      images: Array.isArray(property.images) ? property.images.filter(Boolean) : []
    };
  }

  function write(properties) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties.map(normalizeProperty)));
  }

  function read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) throw new Error('missing');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.length) throw new Error('invalid');
      return parsed.map(normalizeProperty);
    } catch (error) {
      write(initialProperties);
      return initialProperties.map(normalizeProperty);
    }
  }

  function upsert(property) {
    const next = normalizeProperty(property);
    const current = read();
    const index = current.findIndex((entry) => entry.id === next.id);
    if (index >= 0) current[index] = next;
    else current.unshift(next);
    write(current);
    return next;
  }

  function remove(id) {
    const next = read().filter((property) => property.id !== id);
    write(next);
    return next;
  }

  function getById(id) {
    return read().find((property) => property.id === id) || null;
  }

  function filter(properties, filters = {}) {
    const query = String(filters.query || '').trim().toLowerCase();
    const city = String(filters.city || '').trim().toLowerCase();
    const category = filters.category || '';
    const status = filters.status || '';
    const minPrice = Number(filters.minPrice) || 0;
    const maxPrice = Number(filters.maxPrice) || 0;
    const sort = filters.sort || 'latest';

    const next = properties.filter((property) => {
      const haystack = [property.title, property.description, property.address, property.city].join(' ').toLowerCase();
      if (query && !haystack.includes(query)) return false;
      if (city && property.city.toLowerCase() !== city) return false;
      if (category && property.category !== category) return false;
      if (status && property.status !== status) return false;
      if (minPrice && property.price < minPrice) return false;
      if (maxPrice && property.price > maxPrice) return false;
      return true;
    });

    next.sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'area-desc') return b.area - a.area;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return next;
  }

  function getCities(properties = read()) {
    return [...new Set(properties.map((property) => property.city).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function stats(properties = read()) {
    return {
      total: properties.length,
      published: properties.filter((property) => property.status === 'published').length,
      draft: properties.filter((property) => property.status === 'draft').length,
      cities: getCities(properties).length
    };
  }

  return {
    createId,
    read,
    write,
    upsert,
    remove,
    getById,
    filter,
    getCities,
    stats
  };
})();

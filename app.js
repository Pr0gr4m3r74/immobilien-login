window.App = (() => {
  const { STORAGE_KEYS, defaults } = window.CONFIG;

  const translations = {
    de: {
      siteTitle: 'Luma Estates | Immobilienplattform',
      siteDescription: 'Moderne Immobilienplattform zum Suchen, Verwalten und Vermarkten hochwertiger Objekte.',
      navBrand: 'Luma Estates',
      navBrowse: 'Immobilien',
      navWorkspace: 'Workspace',
      navSupport: 'Kontakt',
      themeToggle: 'Dark Mode',
      languageToggle: 'EN',
      heroEyebrow: 'Digitale Immobilienplattform',
      heroTitle: 'Immobilien suchen, verwalten und professionell präsentieren.',
      heroText: 'Ein modernes Portal für Exposés, Objektpflege, Galerien und schnelle Suchanfragen – optimiert für Desktop, Tablet und Smartphone.',
      heroPrimary: 'Objekte entdecken',
      heroSecondary: 'Workspace öffnen',
      heroStatOneLabel: 'Aktive Inserate',
      heroStatTwoLabel: 'Standorte',
      heroStatThreeValue: '21 Tage',
      heroStatThreeLabel: 'Ø Vermarktungszeit',
      quickSearchTitle: 'Passende Immobilie finden',
      quickSearchText: 'Suche nach Ort, Kategorie oder Status und springe direkt zu relevanten Angeboten.',
      quickSearchQueryLabel: 'Suchbegriff',
      quickSearchQueryPlaceholder: 'z. B. Penthouse, Garten, Stuttgart',
      quickSearchCityLabel: 'Ort',
      quickSearchCityPlaceholder: 'Alle Städte',
      quickSearchStatusLabel: 'Status',
      quickSearchStatusAny: 'Alle Status',
      quickSearchButton: 'Suche starten',
      featuredEyebrow: 'Ausgewählte Objekte',
      featuredTitle: 'Kuratiertes Portfolio mit echter Produktanmutung',
      featuredText: 'Alle Karten, Preise, Statuswerte und Galerien basieren auf denselben Daten wie der Workspace.',
      highlightsTitle: 'Warum sich die Plattform wie ein echtes Produkt anfühlt',
      highlightOneTitle: 'Professionelle Vermarktung',
      highlightOneText: 'Starke Visuals, klare Informationsblöcke und prägnante Objektkarten mit Galerie und Status.',
      highlightTwoTitle: 'Verwaltung ohne Umwege',
      highlightTwoText: 'Objekte anlegen, bearbeiten, sortieren und filtern – direkt in einem konsistenten Workflow.',
      highlightThreeTitle: 'DE/EN und Dark Mode',
      highlightThreeText: 'Sofortige Sprachumschaltung und sauber abgestimmte Light- und Dark-Varianten.',
      accessTitle: 'Workspace-Zugang',
      accessText: 'Für die Demo stehen ein Kunden- und ein Admin-Zugang bereit. Der Fokus liegt auf dem Produkt, nicht auf einer Login-Maske.',
      passwordLabel: 'Passwort',
      passwordPlaceholder: 'Passwort eingeben',
      loginCustomer: 'Als Kunde öffnen',
      loginAdmin: 'Als Admin öffnen',
      loginHint: 'Demo-Zugang: Kunde 1234 · Admin Admin',
      loginSuccess: 'Zugang erfolgreich – Workspace wird geöffnet …',
      loginEmpty: 'Bitte ein Passwort eingeben.',
      loginThrottle: 'Bitte einen Moment warten …',
      loginFail: 'Falsches Passwort. Noch {count} Versuch(e) verfügbar.',
      loginCooldown: 'Zu viele Fehlversuche. Bitte {count}s warten.',
      loginFooter: '© {year} Luma Estates GmbH · {location}',
      surfaceTitle: 'Marktplatz & Verwaltung in einem System',
      supportTitle: 'Kontakt',
      supportText: 'Demo-Plattform für hochwertige Wohn- und Investmentobjekte',
      workspaceTitle: 'Property Workspace',
      workspaceEyebrow: 'Immobilienverwaltung',
      workspaceIntro: 'Suche, filtere, erstelle und bearbeite Angebote in einer klaren, produktreifen Oberfläche.',
      logout: 'Abmelden',
      dashboardBadgeAdmin: 'Admin-Modus',
      dashboardBadgeCustomer: 'Kunden-Modus',
      dashboardStatOne: 'Angebote gesamt',
      dashboardStatTwo: 'Veröffentlicht',
      dashboardStatThree: 'Entwürfe',
      dashboardStatFour: 'Standorte',
      filterTitle: 'Suche & Filter',
      filterText: 'Finde passende Objekte nach Stadt, Kategorie, Status und Preisspanne.',
      filterQueryLabel: 'Suchbegriff',
      filterQueryPlaceholder: 'Titel, Ort oder Beschreibung',
      filterCategoryLabel: 'Kategorie',
      filterCategoryAny: 'Alle Kategorien',
      filterStatusLabel: 'Status',
      filterStatusAny: 'Alle Status',
      filterCityLabel: 'Ort',
      filterCityAny: 'Alle Orte',
      filterMinPriceLabel: 'Preis ab',
      filterMaxPriceLabel: 'Preis bis',
      filterSortLabel: 'Sortierung',
      filterSortLatest: 'Neueste zuerst',
      filterSortPriceAsc: 'Preis aufsteigend',
      filterSortPriceDesc: 'Preis absteigend',
      filterSortAreaDesc: 'Größe absteigend',
      filterSearchButton: 'Suche ausführen',
      filterResetButton: 'Filter zurücksetzen',
      resultsLabel: '{count} passende Objekte',
      resultsEmpty: 'Keine Immobilien entsprechen den aktuellen Filtern.',
      managerTitle: 'Objekt anlegen oder bearbeiten',
      managerText: 'Pflege alle Kerndaten in einem Formular. Bilder lassen sich mehrfach hochladen, neu sortieren und entfernen.',
      managerEditing: 'Bearbeitung aktiv',
      managerCreate: 'Neues Objekt',
      fieldTitle: 'Titel',
      fieldTitlePlaceholder: 'z. B. Panorama Penthouse am Killesberg',
      fieldDescription: 'Beschreibung',
      fieldDescriptionPlaceholder: 'Beschreibe Highlights, Ausstattung und Lage.',
      fieldPrice: 'Preis',
      fieldAddress: 'Adresse',
      fieldAddressPlaceholder: 'Straße und Hausnummer',
      fieldCity: 'Ort',
      fieldCityPlaceholder: 'z. B. Stuttgart',
      fieldArea: 'Größe (m²)',
      fieldRooms: 'Zimmer',
      fieldCategory: 'Kategorie',
      fieldStatus: 'Status',
      categoryApartment: 'Wohnung',
      categoryHouse: 'Haus',
      categoryPenthouse: 'Penthouse',
      categoryOffice: 'Gewerbe',
      statusPublished: 'Veröffentlicht',
      statusDraft: 'Entwurf',
      statusReserved: 'Reserviert',
      fieldImages: 'Bilder',
      imageUploadText: 'Mehrere Bilder hochladen',
      imageUrlsLabel: 'Bild-URLs hinzufügen',
      imageUrlsPlaceholder: 'Jede URL in einer neuen Zeile',
      addImageUrls: 'URLs übernehmen',
      imageHelp: 'Bilder erscheinen sofort in der Vorschau und können sortiert oder entfernt werden.',
      submitCreate: 'Objekt speichern',
      submitUpdate: 'Objekt aktualisieren',
      cancelEdit: 'Bearbeitung abbrechen',
      formSuccessCreate: 'Objekt erfolgreich gespeichert.',
      formSuccessUpdate: 'Objekt erfolgreich aktualisiert.',
      formErrorRequired: 'Bitte alle Pflichtfelder ausfüllen.',
      formErrorImages: 'Mindestens ein Bild wird benötigt.',
      inventoryTitle: 'Portfolio',
      inventoryText: 'Alle Objekte in einer modernen Kartenansicht mit klaren Aktionen.',
      inventoryAdminText: 'Bearbeite, öffne oder entferne Objekte direkt aus dem Portfolio.',
      inventoryCustomerText: 'Entdecke das Portfolio in einer fokussierten Kundenansicht.',
      cardActionDetails: 'Details',
      cardActionEdit: 'Bearbeiten',
      cardActionDelete: 'Entfernen',
      cardFeatured: 'Top-Objekt',
      cardStatusPublished: 'Veröffentlicht',
      cardStatusDraft: 'Entwurf',
      cardStatusReserved: 'Reserviert',
      detailMetaArea: '{value} m²',
      detailMetaRooms: '{value} Zimmer',
      detailMetaCategory: '{value}',
      modalClose: 'Schließen',
      galleryTitle: 'Objektdetails',
      galleryContact: 'Besichtigung anfragen',
      deleteConfirm: 'Dieses Objekt wirklich entfernen?',
      validationRequired: 'Pflichtfeld',
      previewTitle: 'Bildvorschau',
      previewEmpty: 'Noch keine Bilder ausgewählt.',
      previewMoveLeft: 'Nach links',
      previewMoveRight: 'Nach rechts',
      previewRemove: 'Entfernen',
      sessionExpired: 'Session abgelaufen – bitte erneut anmelden.',
      inactiveLocked: '30 Minuten Inaktivität – bitte erneut anmelden.'
    },
    en: {
      siteTitle: 'Luma Estates | Property Platform',
      siteDescription: 'Modern property platform for searching, managing and presenting premium listings.',
      navBrand: 'Luma Estates',
      navBrowse: 'Properties',
      navWorkspace: 'Workspace',
      navSupport: 'Contact',
      themeToggle: 'Light Mode',
      languageToggle: 'DE',
      heroEyebrow: 'Digital property platform',
      heroTitle: 'Search, manage and present properties with a professional product feel.',
      heroText: 'A modern portal for exposés, listing management, galleries and fast search flows – optimised for desktop, tablet and mobile.',
      heroPrimary: 'Explore listings',
      heroSecondary: 'Open workspace',
      heroStatOneLabel: 'Active listings',
      heroStatTwoLabel: 'Locations',
      heroStatThreeValue: '21 days',
      heroStatThreeLabel: 'Avg. marketing time',
      quickSearchTitle: 'Find the right property',
      quickSearchText: 'Search by city, category or status and jump straight to relevant listings.',
      quickSearchQueryLabel: 'Search term',
      quickSearchQueryPlaceholder: 'e.g. penthouse, garden, Stuttgart',
      quickSearchCityLabel: 'City',
      quickSearchCityPlaceholder: 'All cities',
      quickSearchStatusLabel: 'Status',
      quickSearchStatusAny: 'Any status',
      quickSearchButton: 'Run search',
      featuredEyebrow: 'Selected listings',
      featuredTitle: 'Curated portfolio with a real product experience',
      featuredText: 'Every card, price, status and gallery is powered by the same data as the workspace.',
      highlightsTitle: 'Why the platform feels production-ready',
      highlightOneTitle: 'Professional marketing',
      highlightOneText: 'Strong visuals, clear information blocks and concise property cards with gallery and status.',
      highlightTwoTitle: 'Management without friction',
      highlightTwoText: 'Create, edit, reorder and filter listings in a single consistent workflow.',
      highlightThreeTitle: 'DE/EN and dark mode',
      highlightThreeText: 'Instant language switching and carefully tuned light and dark themes.',
      accessTitle: 'Workspace access',
      accessText: 'The demo includes customer and admin access. The product takes centre stage instead of a plain login form.',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter password',
      loginCustomer: 'Open as customer',
      loginAdmin: 'Open as admin',
      loginHint: 'Demo access: customer 1234 · admin Admin',
      loginSuccess: 'Access granted – opening workspace …',
      loginEmpty: 'Please enter a password.',
      loginThrottle: 'Please wait a moment …',
      loginFail: 'Incorrect password. {count} attempt(s) remaining.',
      loginCooldown: 'Too many failed attempts. Please wait {count}s.',
      loginFooter: '© {year} Luma Estates GmbH · {location}',
      surfaceTitle: 'Marketplace and management in one system',
      supportTitle: 'Contact',
      supportText: 'Demo platform for premium residential and investment properties',
      workspaceTitle: 'Property Workspace',
      workspaceEyebrow: 'Property management',
      workspaceIntro: 'Search, filter, create and edit listings in a clear, product-ready interface.',
      logout: 'Log out',
      dashboardBadgeAdmin: 'Admin mode',
      dashboardBadgeCustomer: 'Customer mode',
      dashboardStatOne: 'Total listings',
      dashboardStatTwo: 'Published',
      dashboardStatThree: 'Drafts',
      dashboardStatFour: 'Locations',
      filterTitle: 'Search & filters',
      filterText: 'Find relevant properties by city, category, status and price range.',
      filterQueryLabel: 'Search term',
      filterQueryPlaceholder: 'Title, location or description',
      filterCategoryLabel: 'Category',
      filterCategoryAny: 'All categories',
      filterStatusLabel: 'Status',
      filterStatusAny: 'All status values',
      filterCityLabel: 'City',
      filterCityAny: 'All cities',
      filterMinPriceLabel: 'Price from',
      filterMaxPriceLabel: 'Price to',
      filterSortLabel: 'Sort by',
      filterSortLatest: 'Newest first',
      filterSortPriceAsc: 'Price ascending',
      filterSortPriceDesc: 'Price descending',
      filterSortAreaDesc: 'Size descending',
      filterSearchButton: 'Search',
      filterResetButton: 'Reset filters',
      resultsLabel: '{count} matching properties',
      resultsEmpty: 'No properties match the current filters.',
      managerTitle: 'Create or edit property',
      managerText: 'Maintain all core information in one form. Upload, reorder and remove multiple images.',
      managerEditing: 'Editing now',
      managerCreate: 'New property',
      fieldTitle: 'Title',
      fieldTitlePlaceholder: 'e.g. Panorama penthouse at Killesberg',
      fieldDescription: 'Description',
      fieldDescriptionPlaceholder: 'Describe highlights, features and location.',
      fieldPrice: 'Price',
      fieldAddress: 'Address',
      fieldAddressPlaceholder: 'Street and house number',
      fieldCity: 'City',
      fieldCityPlaceholder: 'e.g. Stuttgart',
      fieldArea: 'Size (sqm)',
      fieldRooms: 'Rooms',
      fieldCategory: 'Category',
      fieldStatus: 'Status',
      categoryApartment: 'Apartment',
      categoryHouse: 'House',
      categoryPenthouse: 'Penthouse',
      categoryOffice: 'Commercial',
      statusPublished: 'Published',
      statusDraft: 'Draft',
      statusReserved: 'Reserved',
      fieldImages: 'Images',
      imageUploadText: 'Upload multiple images',
      imageUrlsLabel: 'Add image URLs',
      imageUrlsPlaceholder: 'One URL per line',
      addImageUrls: 'Add URLs',
      imageHelp: 'Images appear instantly in the preview and can be reordered or removed.',
      submitCreate: 'Save property',
      submitUpdate: 'Update property',
      cancelEdit: 'Cancel editing',
      formSuccessCreate: 'Property saved successfully.',
      formSuccessUpdate: 'Property updated successfully.',
      formErrorRequired: 'Please complete all required fields.',
      formErrorImages: 'At least one image is required.',
      inventoryTitle: 'Portfolio',
      inventoryText: 'All properties in a modern card view with clear actions.',
      inventoryAdminText: 'Edit, open or remove properties directly from the portfolio.',
      inventoryCustomerText: 'Explore the portfolio in a focused customer view.',
      cardActionDetails: 'Details',
      cardActionEdit: 'Edit',
      cardActionDelete: 'Remove',
      cardFeatured: 'Featured',
      cardStatusPublished: 'Published',
      cardStatusDraft: 'Draft',
      cardStatusReserved: 'Reserved',
      detailMetaArea: '{value} sqm',
      detailMetaRooms: '{value} rooms',
      detailMetaCategory: '{value}',
      modalClose: 'Close',
      galleryTitle: 'Property details',
      galleryContact: 'Request viewing',
      deleteConfirm: 'Remove this property?',
      validationRequired: 'Required field',
      previewTitle: 'Image preview',
      previewEmpty: 'No images selected yet.',
      previewMoveLeft: 'Move left',
      previewMoveRight: 'Move right',
      previewRemove: 'Remove',
      sessionExpired: 'Session expired – please sign in again.',
      inactiveLocked: '30 minutes of inactivity – please sign in again.'
    }
  };

  function getLanguage() {
    return localStorage.getItem(STORAGE_KEYS.language) || defaults.language;
  }

  function setLanguage(language) {
    const next = translations[language] ? language : defaults.language;
    localStorage.setItem(STORAGE_KEYS.language, next);
    document.documentElement.lang = next;
    window.dispatchEvent(new CustomEvent('app:languagechange', { detail: next }));
    return next;
  }

  function getTheme() {
    return localStorage.getItem(STORAGE_KEYS.theme) || defaults.theme;
  }

  function setTheme(theme) {
    const next = theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEYS.theme, next);
    document.documentElement.setAttribute('data-theme', next);
    window.dispatchEvent(new CustomEvent('app:themechange', { detail: next }));
    return next;
  }

  function t(key, vars = {}, language = getLanguage()) {
    const dict = translations[language] || translations[defaults.language];
    const template = dict[key] || translations[defaults.language][key] || key;
    return Object.entries(vars).reduce((value, [name, replacement]) => value.split(`{${name}}`).join(String(replacement)), template);
  }

  function translateDocument(root = document) {
    const language = getLanguage();
    root.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = t(node.dataset.i18n, {}, language);
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      node.setAttribute('placeholder', t(node.dataset.i18nPlaceholder, {}, language));
    });
    document.title = t('siteTitle', {}, language);
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', t('siteDescription', {}, language));
    document.documentElement.lang = language;
  }

  function initControls(scope = document) {
    const themeButtons = scope.querySelectorAll('[data-theme-toggle]');
    const languageButtons = scope.querySelectorAll('[data-language-toggle]');

    const updateButtons = () => {
      const language = getLanguage();
      const theme = getTheme();
      themeButtons.forEach((button) => {
        button.textContent = theme === 'dark' ? `☀︎ ${t('themeToggle')}` : `☾ ${t('themeToggle')}`;
      });
      languageButtons.forEach((button) => {
        button.textContent = t('languageToggle', {}, language);
      });
    };

    themeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
        translateDocument();
        updateButtons();
      });
    });

    languageButtons.forEach((button) => {
      button.addEventListener('click', () => {
        setLanguage(getLanguage() === 'de' ? 'en' : 'de');
        translateDocument();
        updateButtons();
      });
    });

    updateButtons();
    return updateButtons;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat(getLanguage() === 'de' ? 'de-DE' : 'en-GB', {
      style: 'currency',
      currency: window.CONFIG.defaults.currency,
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat(getLanguage() === 'de' ? 'de-DE' : 'en-GB', {
      maximumFractionDigits: 1
    }).format(Number(value) || 0);
  }

  setTheme(getTheme());
  setLanguage(getLanguage());

  return {
    getLanguage,
    setLanguage,
    getTheme,
    setTheme,
    t,
    translateDocument,
    initControls,
    formatCurrency,
    formatNumber
  };
})();

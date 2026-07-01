const DB_NAME = 'meal-memory-db';
const DB_VERSION = 1;
const SCHEMA_VERSION = 1;

const STORE_NAMES = ['restaurants', 'profiles', 'dishes', 'meals', 'mealDishes', 'photos'];

const state = {
  route: 'home',
  selectedId: null,
  query: '',
  data: {
    restaurants: [],
    profiles: [],
    dishes: [],
    meals: [],
    mealDishes: [],
    photos: []
  },
  modal: null,
  placeWizard: null,
  toast: '',
  deferredInstallPrompt: null,
  photoUrls: new Map()
};

const leafletLoader = {
  promise: null
};

const app = document.querySelector('#app');

const icons = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>',
  store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h16l-1-6H5l-1 6Z"/><path d="M6 10v10h12V10"/><path d="M9 20v-6h6v6"/><path d="M4 10c0 2 4 2 4 0 0 2 4 2 4 0 0 2 4 2 4 0 0 2 4 2 4 0"/></svg>',
  meal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v20"/><path d="M4 2v5a4 4 0 0 0 8 0V2"/><path d="M18 2v20"/><path d="M18 2c2 2 3 5 3 8s-1 5-3 6"/></svg>',
  dish: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s6-4.4 6-11a6 6 0 1 0-12 0c0 6.6 6 11 6 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 4 16 7h4v13H4V7h4l1.5-3Z"/><circle cx="12" cy="13" r="3"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3.5-.2-.1a1.7 1.7 0 0 0-2 .3l-.4.2a1.7 1.7 0 0 0-1 1.5V24h-4v-.6a1.7 1.7 0 0 0-1-1.5l-.4-.2a1.7 1.7 0 0 0-2-.3l-.2.1-2-3.5.1-.1A1.7 1.7 0 0 0 5 15.9l-.2-.4a1.7 1.7 0 0 0-1.5-1H3v-4h.3a1.7 1.7 0 0 0 1.5-1l.2-.4a1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-3.5.2.1a1.7 1.7 0 0 0 2-.3l.4-.2a1.7 1.7 0 0 0 1-1.5V1h4v.6a1.7 1.7 0 0 0 1 1.5l.4.2a1.7 1.7 0 0 0 2 .3l.2-.1 2 3.5-.1.1a1.7 1.7 0 0 0-.3 1.9l.2.4a1.7 1.7 0 0 0 1.5 1h.3v4h-.3a1.7 1.7 0 0 0-1.5 1Z"/></svg>'
};

const dbPromise = openDb();

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of STORE_NAMES) {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt');
          store.createIndex('deletedAt', 'deletedAt');
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function tx(storeName, mode, callback) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const result = callback(store);
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

const repository = {
  async list(storeName) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      const request = db.transaction(storeName, 'readonly').objectStore(storeName).getAll();
      request.onsuccess = () =>
        resolve(request.result.filter((item) => !item.deletedAt).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
      request.onerror = () => reject(request.error);
    });
  },
  async save(storeName, item) {
    await tx(storeName, 'readwrite', (store) => store.put(item));
    return item;
  },
  async softDelete(storeName, id) {
    const existing = state.data[storeName].find((item) => item.id === id);
    if (!existing) return;
    await repository.save(storeName, { ...existing, deletedAt: now(), updatedAt: now() });
  },
  async clearAndImport(payload) {
    const db = await dbPromise;
    await Promise.all(
      STORE_NAMES.map(
        (storeName) =>
          new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            transaction.objectStore(storeName).clear();
            transaction.oncomplete = resolve;
            transaction.onerror = () => reject(transaction.error);
          })
      )
    );

    for (const storeName of STORE_NAMES) {
      const items = Array.isArray(payload[storeName]) ? payload[storeName] : [];
      for (const item of items) {
        await repository.save(storeName, item);
      }
    }
  }
};

const photoStorage = {
  async put(file, ownerType, ownerId) {
    const dataUrl = await resizeImage(file, 1600, 0.86);
    const thumbUrl = await resizeImage(file, 360, 0.78);
    const photo = makeEntity({
      ownerType,
      ownerId,
      storageProvider: 'local_indexeddb',
      storageKey: id('photo_blob'),
      dataUrl,
      thumbnailDataUrl: thumbUrl,
      mimeType: 'image/jpeg',
      altText: file.name || 'Meal photo'
    });
    await repository.save('photos', photo);
    return photo;
  }
};

function makeEntity(values = {}) {
  const timestamp = now();
  return {
    id: values.id || id(),
    createdAt: values.createdAt || timestamp,
    updatedAt: timestamp,
    deletedAt: values.deletedAt || null,
    schemaVersion: SCHEMA_VERSION,
    ...values
  };
}

function id(prefix = 'id') {
  if (crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function now() {
  return new Date().toISOString();
}

function roundCoord(value) {
  return Math.round(Number(value) * 1000000) / 1000000;
}

function formatCoordinate(value) {
  return Number(value).toFixed(6);
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function makeMapsUrl(lat, lng, label = '') {
  const query = label ? `${label} @ ${lat},${lng}` : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function makeYelpSearchUrl(name, address = '', city = '') {
  const location = [address, city].filter(Boolean).join(', ');
  return `https://www.yelp.com/search?find_desc=${encodeURIComponent(name || '')}&find_loc=${encodeURIComponent(location || city || '')}`;
}

async function loadLeaflet() {
  if (window.L) return window.L;
  if (!leafletLoader.promise) {
    leafletLoader.promise = new Promise((resolve, reject) => {
      const existingCss = document.querySelector('link[data-leaflet-css]');
      if (!existingCss) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.crossOrigin = '';
        link.setAttribute('data-leaflet-css', 'true');
        document.head.appendChild(link);
      }

      if (window.L) {
        resolve(window.L);
        return;
      }

      const existingScript = document.querySelector('script[data-leaflet-js]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.L), { once: true });
        existingScript.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.crossOrigin = '';
      script.setAttribute('data-leaflet-js', 'true');
      script.onload = () => resolve(window.L);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return leafletLoader.promise;
}

function todayLocal() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeList(value = '') {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function displayDate(value) {
  if (!value) return 'No date';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function stars(rating) {
  if (!rating) return '<span class="muted">Not rated</span>';
  const rounded = Math.round(Number(rating));
  return `<span class="rating" aria-label="${rounded} out of 5 stars">${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}</span>`;
}

function firstPhoto(ownerType, ownerId) {
  return state.data.photos.find((photo) => photo.ownerType === ownerType && photo.ownerId === ownerId);
}

function getRestaurant(idValue) {
  return state.data.restaurants.find((restaurant) => restaurant.id === idValue);
}

function getProfile(idValue) {
  return state.data.profiles.find((profile) => profile.id === idValue);
}

function getDish(idValue) {
  return state.data.dishes.find((dish) => dish.id === idValue);
}

async function loadData() {
  for (const storeName of STORE_NAMES) {
    state.data[storeName] = await repository.list(storeName);
  }
}

function setRoute(route, selectedId = null) {
  state.route = route;
  state.selectedId = selectedId;
  location.hash = selectedId ? `${route}/${selectedId}` : route;
  render();
}

function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  if (!hash) return { route: 'home', selectedId: null };
  const [route, selectedId] = hash.split('/');
  return { route, selectedId: selectedId || null };
}

function showToast(message) {
  state.toast = message;
  render();
  setTimeout(() => {
    state.toast = '';
    render();
  }, 2600);
}

function installHint() {
  return 'On iPhone or iPad, use Safari Share -> Add to Home Screen.';
}

function emptyRestaurantDraft() {
  return {
    name: '',
    address: '',
    city: '',
    region: '',
    latitude: '',
    longitude: '',
    phone: '',
    websiteUrl: '',
    directionsUrl: '',
    yelpUrl: '',
    cuisineTags: '',
    notes: ''
  };
}

function createPlaceWizard() {
  return {
    step: 'location',
    entryMode: 'guided',
    coords: null,
    currentLocationLabel: '',
    results: [],
    selectedResult: null,
    draft: emptyRestaurantDraft(),
    loading: false,
    error: '',
    mapToken: id('place_wizard_map')
  };
}

function openModal(type, record = null) {
  state.modal = { type, record };
  render();
}

function closeModal() {
  state.modal = null;
  if (state.selectedId === 'new') {
    state.selectedId = null;
    location.hash = `#${state.route}`;
  }
  render();
}

function closePlaceWizard() {
  state.placeWizard = null;
  if (state.selectedId === 'new') {
    state.selectedId = null;
    location.hash = '#restaurants';
  }
  render();
}

function navItem(route, label, icon) {
  return `<button type="button" class="nav-item ${state.route === route ? 'active' : ''}" data-route="${route}" aria-label="${label}">${icon}<span>${label}</span></button>`;
}

function renderShell(content) {
  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="topbar-inner">
          <button class="brand button ghost" data-route="home" aria-label="Meal Memory home">
            <img src="./src/icon.svg" alt="" />
            <span>Meal Memory</span>
          </button>
          <label class="global-search">
            ${icons.search}
            <input id="global-search" type="search" value="${escapeHtml(state.query)}" placeholder="Search meals, dishes, notes, people" aria-label="Search meals, dishes, notes, people" />
          </label>
          <button type="button" class="button primary install-button" id="install-button">${icons.download}<span>Install</span></button>
        </div>
      </header>
      <nav class="bottom-nav" aria-label="Primary">
        <div class="bottom-nav-inner">
          ${navItem('home', 'Home', icons.home)}
          ${navItem('restaurants', 'Places', icons.store)}
          ${navItem('meals', 'Meals', icons.meal)}
          ${navItem('dishes', 'Dishes', icons.dish)}
          ${navItem('people', 'People', icons.people)}
        </div>
      </nav>
      <main class="main">${content}</main>
    </div>
    ${state.modal ? renderModal() : ''}
    ${state.placeWizard ? renderPlaceWizard() : ''}
    ${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ''}
  `; 

  const installButton = document.querySelector('#install-button');
  if (state.deferredInstallPrompt && installButton) installButton.style.display = 'inline-flex';
  wireShellActions();
  if (state.placeWizard && state.placeWizard.step === 'location') {
    setTimeout(() => initPlaceWizardMap().catch(() => {}), 0);
  }
}

function wireShellActions() {
  document.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', () => setRoute(button.dataset.route, button.dataset.id || null), { once: true });
  });

  document.querySelectorAll('[data-action="open-modal"]').forEach((button) => {
    const open = () => {
      const record = button.dataset.id ? findRecord(button.dataset.open, button.dataset.id) : null;
      state.modal = {
        type: button.dataset.open,
        record,
        restaurantId: button.dataset.restaurantId,
        mealId: button.dataset.mealId
      };
      render();
    };
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      open();
    }, { once: true });
    button.addEventListener('click', open, { once: true });
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    }, { once: true });
  });

  const clearSearch = document.querySelector('#clear-search');
  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      state.query = '';
      render();
    }, { once: true });
  }

  const wizardClose = document.querySelector('#wizard-close');
  if (wizardClose) wizardClose.addEventListener('click', closePlaceWizard, { once: true });

  const wizardCloseIcon = document.querySelector('#wizard-close-icon');
  if (wizardCloseIcon) wizardCloseIcon.addEventListener('click', closePlaceWizard, { once: true });

  const wizardSkipLocation = document.querySelector('#wizard-skip-location');
  if (wizardSkipLocation) wizardSkipLocation.addEventListener('click', skipWizardLocation, { once: true });

  const wizardUseCurrent = document.querySelector('#wizard-use-current');
  if (wizardUseCurrent) wizardUseCurrent.addEventListener('click', () => useCurrentLocation(), { once: true });

  const wizardSearchNearby = document.querySelector('#wizard-search-nearby');
  if (wizardSearchNearby) wizardSearchNearby.addEventListener('click', () => searchWizardNearby(), { once: true });

  const wizardNextFromLocation = document.querySelector('#wizard-next-from-location');
  if (wizardNextFromLocation) wizardNextFromLocation.addEventListener('click', () => searchWizardNearby(), { once: true });

  const wizardBackLocation = document.querySelector('#wizard-back-location');
  if (wizardBackLocation) wizardBackLocation.addEventListener('click', () => goToWizardStep('location'), { once: true });

  const wizardBackResults = document.querySelector('#wizard-back-results');
  if (wizardBackResults) wizardBackResults.addEventListener('click', () => goToWizardStep('location'), { once: true });

  const wizardLatitude = document.querySelector('#wizard-latitude');
  if (wizardLatitude) {
    wizardLatitude.addEventListener('change', (event) => {
      const latitude = Number(event.target.value);
      if (!Number.isFinite(latitude)) return;
      const current = parseWizardCoords(state.placeWizard);
      setPlaceWizardCoords(latitude, current ? current.longitude : latitude, { skipReverse: false }).catch(() => {});
    }, { once: true });
  }

  const wizardLongitude = document.querySelector('#wizard-longitude');
  if (wizardLongitude) {
    wizardLongitude.addEventListener('change', (event) => {
      const longitude = Number(event.target.value);
      if (!Number.isFinite(longitude)) return;
      const current = parseWizardCoords(state.placeWizard);
      setPlaceWizardCoords(current ? current.latitude : longitude, longitude, { skipReverse: false }).catch(() => {});
    }, { once: true });
  }

  document.querySelectorAll('[data-place-result-id]').forEach((button) => {
    button.addEventListener('click', () => chooseWizardResult(button.dataset.placeResultId), { once: true });
  });

  const exportDataButton = document.querySelector('#export-data');
  if (exportDataButton) exportDataButton.addEventListener('click', exportData, { once: true });

  const installButton = document.querySelector('#install-button');
  if (installButton) {
    installButton.addEventListener('click', () => {
      if (!state.deferredInstallPrompt) {
        showToast(installHint());
        return;
      }
      state.deferredInstallPrompt.prompt();
      state.deferredInstallPrompt = null;
      render();
    });
  }

  const closeButton = document.querySelector('#close-modal');
  if (closeButton) closeButton.addEventListener('click', closeModal, { once: true });

  const cancelButton = document.querySelector('#cancel-modal');
  if (cancelButton) cancelButton.addEventListener('click', closeModal, { once: true });
}

function render() {
  if (state.query.trim()) {
    renderShell(renderSearch());
  } else if (state.route === 'restaurants' && state.selectedId === 'new') {
    if (!state.placeWizard) state.placeWizard = createPlaceWizard();
    renderShell(renderRestaurants());
  } else if (state.route === 'meals' && state.selectedId === 'new') {
    state.modal = { type: 'meal', record: null };
    renderShell(renderMeals());
  } else if (state.route === 'dishes' && state.selectedId === 'new') {
    state.modal = { type: 'dish', record: null };
    renderShell(renderDishes());
  } else if (state.route === 'people' && state.selectedId === 'new') {
    state.modal = { type: 'profile', record: null };
    renderShell(renderPeople());
  } else if (state.route === 'restaurants' && state.selectedId) {
    renderShell(renderRestaurantDetail(state.selectedId));
  } else if (state.route === 'meals' && state.selectedId) {
    renderShell(renderMealDetail(state.selectedId));
  } else if (state.route === 'dishes' && state.selectedId) {
    renderShell(renderDishDetail(state.selectedId));
  } else if (state.route === 'people' && state.selectedId) {
    renderShell(renderPersonDetail(state.selectedId));
  } else if (state.route === 'restaurants') {
    renderShell(renderRestaurants());
  } else if (state.route === 'meals') {
    renderShell(renderMeals());
  } else if (state.route === 'dishes') {
    renderShell(renderDishes());
  } else if (state.route === 'people') {
    renderShell(renderPeople());
  } else {
    renderShell(renderHome());
  }
}

function renderHome() {
  const recentMeals = state.data.meals.slice(0, 5);
  const favorites = [...state.data.dishes].filter((dish) => dish.orderAgain === 'yes').slice(0, 5);
  const modificationNotes = state.data.dishes.filter((dish) => dish.modificationNotes).slice(0, 4);

  return `
    <section class="hero-row">
      <div>
        <p class="eyebrow">Local-first PWA</p>
        <h1>Remember the meal before the menu does.</h1>
        <p class="muted">Track restaurants, dishes, people, ratings, photos, and the tiny ordering notes that matter next time.</p>
      </div>
      <div class="actions">
        <button type="button" class="button accent" data-route="meals" data-id="new">${icons.plus}<span>Add meal</span></button>
        <button type="button" class="button" data-route="restaurants" data-id="new">${icons.store}<span>Add place</span></button>
      </div>
    </section>
    <section class="grid three" aria-label="Meal Memory totals">
      ${statCard('Restaurants', state.data.restaurants.length)}
      ${statCard('Meals', state.data.meals.length)}
      ${statCard('People', state.data.profiles.length)}
    </section>
    <section class="section grid two">
      <div>
        <div class="section-header">
          <h2>Recent meals</h2>
          <button type="button" class="button ghost" data-route="meals">View all</button>
        </div>
        <div class="list">${recentMeals.length ? recentMeals.map(mealCard).join('') : emptyState('Add your first meal to start building memory.')}</div>
      </div>
      <div>
        <div class="section-header">
          <h2>Order again</h2>
          <button type="button" class="button ghost" data-route="dishes">View dishes</button>
        </div>
        <div class="list">${favorites.length ? favorites.map(dishCard).join('') : emptyState('Favorite dishes will appear here.')}</div>
      </div>
    </section>
    <section class="section">
      <div class="section-header">
        <h2>Notes for next time</h2>
      </div>
      <div class="grid two">${modificationNotes.length ? modificationNotes.map(modificationCard).join('') : emptyState('Modification notes help future-you order smarter.')}</div>
    </section>
    ${settingsPanel()}
  `;
}

function statCard(label, value) {
  return `<div class="card stat-card"><div class="stat-value">${value}</div><div class="muted">${label}</div></div>`;
}

function renderRestaurants() {
  return `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Restaurants</p>
        <h1>Places</h1>
        <p class="muted">Your private restaurant memory, from favorite tables to things worth skipping.</p>
      </div>
      <button type="button" class="button primary" data-route="restaurants" data-id="new">${icons.plus}<span>Add place</span></button>
    </section>
    <div class="grid two">${state.data.restaurants.length ? state.data.restaurants.map(restaurantCard).join('') : emptyState('Add a restaurant, then attach meals and dishes to it.')}</div>
  `;
}

function renderMeals() {
  return `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Visits</p>
        <h1>Meals</h1>
        <p class="muted">Every restaurant visit, who came along, and what was worth remembering.</p>
      </div>
      <button type="button" class="button primary" data-action="open-modal" data-open="meal">${icons.plus}<span>Add meal</span></button>
    </section>
    <div class="list">${state.data.meals.length ? state.data.meals.map(mealCard).join('') : emptyState('Save a meal with only a restaurant and date, then add detail later.')}</div>
  `;
}

function renderDishes() {
  return `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Dishes</p>
        <h1>Dishes</h1>
        <p class="muted">The useful record of what to reorder, modify, share, or avoid.</p>
      </div>
      <button type="button" class="button primary" data-action="open-modal" data-open="dish">${icons.plus}<span>Add dish</span></button>
    </section>
    <div class="grid two">${state.data.dishes.length ? state.data.dishes.map(dishCard).join('') : emptyState('Dishes can be created here or inside the add-meal flow.')}</div>
  `;
}

function renderPeople() {
  return `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Profiles</p>
        <h1>People</h1>
        <p class="muted">Track who was there and what each person liked.</p>
      </div>
      <button type="button" class="button primary" data-action="open-modal" data-open="profile">${icons.plus}<span>Add person</span></button>
    </section>
    <div class="grid two">${state.data.profiles.length ? state.data.profiles.map(profileCard).join('') : emptyState('Add yourself, a partner, children, friends, or family members.')}</div>
  `;
}

function renderSearch() {
  const query = state.query.toLowerCase().trim();
  const restaurants = state.data.restaurants.filter((item) => searchable(item, ['name', 'address', 'city', 'notes'], query, item.cuisineTags));
  const dishes = state.data.dishes.filter((item) =>
    searchable(item, ['name', 'description', 'modificationNotes'], query, item.tags)
  );
  const profiles = state.data.profiles.filter((item) =>
    searchable(item, ['displayName', 'relationship', 'preferences', 'allergies', 'notes'], query)
  );
  const meals = state.data.meals.filter((item) => {
    const restaurant = getRestaurant(item.restaurantId);
    const people = item.attendeeProfileIds.map((personId) => {
      const profile = getProfile(personId);
      return profile ? profile.displayName : '';
    }).join(' ');
    return searchable(item, ['notes', 'mealType'], query, [restaurant ? restaurant.name : '', people, ...item.occasionTags]);
  });

  return `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Search</p>
        <h1>Results</h1>
        <p class="muted">Searching for "${escapeHtml(state.query)}"</p>
      </div>
      <button type="button" class="button ghost" id="clear-search" data-action="clear-search">${icons.close}<span>Clear</span></button>
    </section>
    <section class="search-results grid two">
      <div class="stack"><h2>Places</h2>${restaurants.length ? restaurants.map(restaurantCard).join('') : emptyState('No restaurants found.')}</div>
      <div class="stack"><h2>Dishes</h2>${dishes.length ? dishes.map(dishCard).join('') : emptyState('No dishes found.')}</div>
      <div class="stack"><h2>Meals</h2>${meals.length ? meals.map(mealCard).join('') : emptyState('No meals found.')}</div>
      <div class="stack"><h2>People</h2>${profiles.length ? profiles.map(profileCard).join('') : emptyState('No people found.')}</div>
    </section>
  `;
}

function searchable(item, keys, query, extras = []) {
  const text = [...keys.map((key) => item[key]), ...extras].filter(Boolean).join(' ').toLowerCase();
  return text.includes(query);
}

function restaurantCard(restaurant) {
  const meals = state.data.meals.filter((meal) => meal.restaurantId === restaurant.id).length;
  const photo = firstPhoto('restaurant', restaurant.id);
  return `
    <button class="card interactive" data-route="restaurants" data-id="${restaurant.id}">
      <div class="row">
        ${photo ? `<img class="thumb" style="width:64px;height:64px" src="${photo.thumbnailDataUrl}" alt="${escapeHtml(photo.altText)}" />` : `<div class="avatar">${escapeHtml(restaurant.name[0] || 'R')}</div>`}
        <div>
          <h3>${escapeHtml(restaurant.name)}</h3>
          <p class="subtle">${escapeHtml([restaurant.city, restaurant.address].filter(Boolean).join(', ') || 'No location yet')}</p>
          <div class="pill-list">${restaurant.cuisineTags.slice(0, 3).map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join('')}<span class="pill warn">${meals} meals</span></div>
        </div>
      </div>
    </button>
  `;
}

function mealCard(meal) {
  const restaurant = getRestaurant(meal.restaurantId);
  const attendees = meal.attendeeProfileIds.map((profileId) => {
    const profile = getProfile(profileId);
    return profile ? profile.displayName : '';
  }).filter(Boolean);
  const photo = firstPhoto('meal_visit', meal.id);
  return `
    <button class="card interactive" data-route="meals" data-id="${meal.id}">
      <div class="row between">
        <div class="row">
          ${photo ? `<img class="thumb" style="width:64px;height:64px" src="${photo.thumbnailDataUrl}" alt="${escapeHtml(photo.altText)}" />` : `<div class="avatar">${icons.meal}</div>`}
          <div>
            <h3>${escapeHtml(restaurant ? restaurant.name : 'Unknown restaurant')}</h3>
            <p class="subtle">${displayDate(meal.visitedAt)}${meal.mealType ? ` · ${escapeHtml(meal.mealType)}` : ''}</p>
            <p class="subtle">${attendees.length ? escapeHtml(attendees.join(', ')) : 'No attendees yet'}</p>
          </div>
        </div>
        ${stars(meal.overallRating)}
      </div>
    </button>
  `;
}

function dishCard(dish) {
  const restaurant = getRestaurant(dish.restaurantId);
  const photo = firstPhoto('dish', dish.id);
  return `
    <button class="card interactive" data-route="dishes" data-id="${dish.id}">
      <div class="row">
        ${photo ? `<img class="thumb" style="width:64px;height:64px" src="${photo.thumbnailDataUrl}" alt="${escapeHtml(photo.altText)}" />` : `<div class="avatar">${icons.dish}</div>`}
        <div>
          <h3>${escapeHtml(dish.name)}</h3>
          <p class="subtle">${escapeHtml(restaurant ? restaurant.name : 'No restaurant')}</p>
          <div class="pill-list">
            ${dish.orderAgain ? `<span class="pill">${escapeHtml(orderAgainLabel(dish.orderAgain))}</span>` : ''}
            ${dish.tags.slice(0, 3).map((tag) => `<span class="pill warn">${escapeHtml(tag)}</span>`).join('')}
          </div>
        </div>
      </div>
    </button>
  `;
}

function profileCard(profile) {
  const meals = state.data.meals.filter((meal) => meal.attendeeProfileIds.includes(profile.id)).length;
  return `
    <button class="card interactive" data-route="people" data-id="${profile.id}">
      <div class="row">
        <div class="avatar" style="background:${escapeHtml(profile.avatarColor || '#275c54')}">${escapeHtml(profile.displayName[0] || 'P')}</div>
        <div>
          <h3>${escapeHtml(profile.displayName)}</h3>
          <p class="subtle">${escapeHtml(profile.relationship || 'Profile')} · ${meals} meals</p>
          <p class="subtle">${escapeHtml(profile.preferences || profile.allergies || 'No preferences yet')}</p>
        </div>
      </div>
    </button>
  `;
}

function modificationCard(dish) {
  const restaurant = getRestaurant(dish.restaurantId);
  return `
    <div class="card">
      <p class="eyebrow">${escapeHtml(restaurant ? restaurant.name : 'Dish note')}</p>
      <h3>${escapeHtml(dish.name)}</h3>
      <p>${escapeHtml(dish.modificationNotes)}</p>
    </div>
  `;
}

function emptyState(text) {
  return `<div class="empty">${escapeHtml(text)}</div>`;
}

function renderRestaurantDetail(idValue) {
  const restaurant = getRestaurant(idValue);
  if (!restaurant) return emptyState('Restaurant not found.');
  const meals = state.data.meals.filter((meal) => meal.restaurantId === restaurant.id);
  const dishes = state.data.dishes.filter((dish) => dish.restaurantId === restaurant.id);
  const photos = state.data.photos.filter((photo) => photo.ownerId === restaurant.id || meals.some((meal) => meal.id === photo.ownerId));
  const yelpUrl = restaurant.yelpUrl || makeYelpSearchUrl(restaurant.name, restaurant.address, restaurant.city);

  return `
    ${detailHeader('Place', restaurant.name, [restaurant.city, restaurant.address].filter(Boolean).join(' · '), 'restaurant', restaurant)}
    <section class="detail-band">
      <div class="stack">
        <div class="card">
          <h2>Restaurant info</h2>
          <p>${escapeHtml(restaurant.notes || 'No restaurant notes yet.')}</p>
          <div class="pill-list">${restaurant.cuisineTags.map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join('')}</div>
          <div class="actions" style="margin-top:12px">
            ${restaurant.directionsUrl ? `<a class="button" href="${escapeHtml(restaurant.directionsUrl)}" target="_blank" rel="noreferrer">Directions</a>` : ''}
            <a class="button" href="${escapeHtml(yelpUrl)}" target="_blank" rel="noreferrer">${icons.search}<span>Yelp</span></a>
            ${restaurant.websiteUrl ? `<a class="button" href="${escapeHtml(restaurant.websiteUrl)}" target="_blank" rel="noreferrer">Website</a>` : ''}
            ${restaurant.phone ? `<a class="button" href="tel:${escapeHtml(restaurant.phone)}">Call</a>` : ''}
          </div>
        </div>
        <div class="card">
          <div class="section-header"><h2>Meal history</h2><button type="button" class="button ghost" data-action="open-modal" data-open="meal" data-restaurant-id="${restaurant.id}">${icons.plus}<span>Add meal</span></button></div>
          <div class="list">${meals.length ? meals.map(mealCard).join('') : emptyState('No meals at this place yet.')}</div>
        </div>
      </div>
      <div class="stack">
        <div class="card">
          <div class="section-header"><h2>Dishes tried</h2><button type="button" class="button ghost" data-action="open-modal" data-open="dish" data-restaurant-id="${restaurant.id}">${icons.plus}<span>Add dish</span></button></div>
          <div class="list">${dishes.length ? dishes.map(dishCard).join('') : emptyState('No dishes yet.')}</div>
        </div>
        <div class="card">
          <div class="section-header"><h2>Photos</h2><label class="button ghost">${icons.camera}<span>Add</span><input class="hidden-file" type="file" accept="image/*" data-photo-owner-type="restaurant" data-photo-owner-id="${restaurant.id}" /></label></div>
          ${photoGrid(photos)}
        </div>
      </div>
    </section>
  `;
}

function renderMealDetail(idValue) {
  const meal = state.data.meals.find((item) => item.id === idValue);
  if (!meal) return emptyState('Meal not found.');
  const restaurant = getRestaurant(meal.restaurantId);
  const attendees = meal.attendeeProfileIds.map(getProfile).filter(Boolean);
  const mealDishes = state.data.mealDishes.filter((item) => item.mealVisitId === meal.id);
  const photos = state.data.photos.filter((photo) => photo.ownerId === meal.id || mealDishes.some((item) => item.id === photo.ownerId));

  return `
    ${detailHeader('Meal', restaurant ? restaurant.name : 'Meal visit', `${displayDate(meal.visitedAt)}${meal.mealType ? ` · ${meal.mealType}` : ''}`, 'meal', meal)}
    <section class="detail-band">
      <div class="stack">
        <div class="card">
          <h2>Visit notes</h2>
          <p>${escapeHtml(meal.notes || 'No visit notes yet.')}</p>
          <div class="row between"><span class="muted">Overall</span>${stars(meal.overallRating)}</div>
          <div class="pill-list" style="margin-top:10px">${meal.occasionTags.map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join('')}</div>
        </div>
        <div class="card">
          <div class="section-header"><h2>Dishes in this meal</h2><button type="button" class="button ghost" data-action="open-modal" data-open="mealDish" data-meal-id="${meal.id}">${icons.plus}<span>Add dish</span></button></div>
          <div class="list">${mealDishes.length ? mealDishes.map(mealDishCard).join('') : emptyState('Add dishes ordered during this visit.')}</div>
        </div>
      </div>
      <div class="stack">
        <div class="card">
          <h2>People</h2>
          <div class="list">${attendees.length ? attendees.map(profileCard).join('') : emptyState('No attendees attached.')}</div>
        </div>
        <div class="card">
          <div class="section-header"><h2>Photos</h2><label class="button ghost">${icons.camera}<span>Add</span><input class="hidden-file" type="file" accept="image/*" data-photo-owner-type="meal_visit" data-photo-owner-id="${meal.id}" /></label></div>
          ${photoGrid(photos)}
        </div>
      </div>
    </section>
  `;
}

function renderDishDetail(idValue) {
  const dish = getDish(idValue);
  if (!dish) return emptyState('Dish not found.');
  const restaurant = getRestaurant(dish.restaurantId);
  const entries = state.data.mealDishes.filter((item) => item.dishId === dish.id);
  const photos = state.data.photos.filter((photo) => photo.ownerId === dish.id || entries.some((item) => item.id === photo.ownerId));

  return `
    ${detailHeader('Dish', dish.name, restaurant ? restaurant.name : 'No restaurant', 'dish', dish)}
    <section class="detail-band">
      <div class="stack">
        <div class="card">
          <h2>Ordering memory</h2>
          <p>${escapeHtml(dish.description || 'No description yet.')}</p>
          <p><strong>Next time:</strong> ${escapeHtml(dish.modificationNotes || 'No modifications saved.')}</p>
          <div class="row between"><span class="muted">Default rating</span>${stars(dish.defaultRating)}</div>
          <div class="pill-list" style="margin-top:10px">
            ${dish.orderAgain ? `<span class="pill">${escapeHtml(orderAgainLabel(dish.orderAgain))}</span>` : ''}
            ${dish.tags.map((tag) => `<span class="pill warn">${escapeHtml(tag)}</span>`).join('')}
          </div>
        </div>
        <div class="card">
          <h2>Times ordered</h2>
          <div class="list">${entries.length ? entries.map(mealDishCard).join('') : emptyState('This dish has not been attached to a meal yet.')}</div>
        </div>
      </div>
        <div class="card">
          <div class="section-header"><h2>Photos</h2><label class="button ghost">${icons.camera}<span>Add</span><input class="hidden-file" type="file" accept="image/*" data-photo-owner-type="dish" data-photo-owner-id="${dish.id}" /></label></div>
        ${photoGrid(photos)}
      </div>
    </section>
  `;
}

function renderPersonDetail(idValue) {
  const profile = getProfile(idValue);
  if (!profile) return emptyState('Profile not found.');
  const meals = state.data.meals.filter((meal) => meal.attendeeProfileIds.includes(profile.id));
  const ratings = state.data.mealDishes.filter((mealDish) =>
    mealDish.perPersonRatings.some((rating) => rating.profileId === profile.id)
  );

  return `
    ${detailHeader('Profile', profile.displayName, profile.relationship || 'Meal companion', 'profile', profile)}
    <section class="detail-band">
      <div class="stack">
        <div class="card">
          <h2>Food notes</h2>
          <p><strong>Preferences:</strong> ${escapeHtml(profile.preferences || 'No preferences saved.')}</p>
          <p><strong>Allergies:</strong> ${escapeHtml(profile.allergies || 'No allergies saved.')}</p>
          <p>${escapeHtml(profile.notes || '')}</p>
        </div>
        <div class="card">
          <h2>Meals together</h2>
          <div class="list">${meals.length ? meals.map(mealCard).join('') : emptyState('No meals with this person yet.')}</div>
        </div>
      </div>
      <div class="card">
        <h2>Dish opinions</h2>
        <div class="list">${ratings.length ? ratings.map(mealDishCard).join('') : emptyState('Per-person dish ratings will show up here.')}</div>
      </div>
    </section>
  `;
}

function detailHeader(eyebrow, title, subtitle, type, record) {
  return `
    <section class="page-heading">
      <div>
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="muted">${escapeHtml(subtitle || '')}</p>
      </div>
      <div class="actions">
        <button type="button" class="button" data-action="open-modal" data-open="${type}" data-id="${record.id}">${icons.edit}<span>Edit</span></button>
        <button type="button" class="button danger" data-delete-type="${type}" data-id="${record.id}">${icons.trash}<span>Delete</span></button>
      </div>
    </section>
  `;
}

function mealDishCard(mealDish) {
  const dish = getDish(mealDish.dishId);
  const meal = state.data.meals.find((item) => item.id === mealDish.mealVisitId);
  const restaurant = meal ? getRestaurant(meal.restaurantId) : dish ? getRestaurant(dish.restaurantId) : null;
  const people = mealDish.eaterProfileIds.map((profileId) => {
    const profile = getProfile(profileId);
    return profile ? profile.displayName : '';
  }).filter(Boolean);
  return `
    <div class="card">
      <div class="row between">
        <div>
          <h3>${escapeHtml(dish ? dish.name : 'Dish')}</h3>
          <p class="subtle">${escapeHtml(restaurant ? restaurant.name : '')}${meal ? ` · ${displayDate(meal.visitedAt)}` : ''}</p>
          <p class="subtle">${people.length ? escapeHtml(people.join(', ')) : 'No eaters attached'}</p>
        </div>
        ${stars(mealDish.rating)}
      </div>
      ${mealDish.modificationNotes ? `<p><strong>Next time:</strong> ${escapeHtml(mealDish.modificationNotes)}</p>` : ''}
      ${mealDish.notes ? `<p>${escapeHtml(mealDish.notes)}</p>` : ''}
    </div>
  `;
}

function photoGrid(photos) {
  if (!photos.length) return emptyState('No photos yet.');
  return `<div class="thumbnail-grid">${photos.map((photo) => `<img class="thumb" src="${photo.thumbnailDataUrl || photo.dataUrl}" alt="${escapeHtml(photo.altText)}" />`).join('')}</div>`;
}

function orderAgainLabel(value) {
  return { yes: 'Order again', maybe: 'Maybe again', no: 'Skip next time' }[value] || value;
}

function renderModal() {
  const { type, record } = state.modal;
  const title = record ? `Edit ${modalLabel(type)}` : `Add ${modalLabel(type)}`;
  return `
    <div class="modal-backdrop" role="presentation">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header>
          <h2 id="modal-title">${escapeHtml(title)}</h2>
          <button class="icon-button" id="close-modal" aria-label="Close">${icons.close}</button>
        </header>
        <form id="entity-form">
          <div class="modal-body">${modalFields(type, record)}</div>
          <footer class="modal-footer">
            <button class="button ghost" type="button" id="cancel-modal">Cancel</button>
            <button class="button primary" type="submit">Save</button>
          </footer>
        </form>
      </section>
    </div>
  `;
}

function modalLabel(type) {
  return { restaurant: 'place', profile: 'person', dish: 'dish', meal: 'meal', mealDish: 'dish entry' }[type] || type;
}

function modalFields(type, record) {
  const safeRecord = record || {};
  if (type === 'restaurant') return restaurantForm(safeRecord);
  if (type === 'profile') return profileForm(safeRecord);
  if (type === 'dish') return dishForm(safeRecord);
  if (type === 'meal') return mealForm(safeRecord);
  if (type === 'mealDish') return mealDishForm(safeRecord);
  return '';
}

function restaurantForm(record = {}) {
  const cuisineTags = Array.isArray(record.cuisineTags) ? record.cuisineTags.join(', ') : record.cuisineTags || '';
  return `
    <div class="form-grid">
      ${field('Name', 'name', record.name, 'text', true)}
      ${field('Cuisine tags', 'cuisineTags', cuisineTags, 'text', false, 'Thai, date night, ramen')}
      ${field('Address', 'address', record.address)}
      ${field('City', 'city', record.city)}
      ${field('Latitude', 'latitude', record.latitude, 'number')}
      ${field('Longitude', 'longitude', record.longitude, 'number')}
      ${field('Phone', 'phone', record.phone, 'tel')}
      ${field('Website', 'websiteUrl', record.websiteUrl, 'url')}
      ${field('Directions URL', 'directionsUrl', record.directionsUrl, 'url')}
      ${field('Yelp URL', 'yelpUrl', record.yelpUrl, 'url')}
      ${field('Notes', 'notes', record.notes, 'textarea')}
    </div>
  `;
}

function updatePlaceWizard(patch, rerender = true) {
  if (!state.placeWizard) return;
  state.placeWizard = { ...state.placeWizard, ...patch };
  if (rerender) render();
}

async function setPlaceWizardCoords(latitude, longitude, options = {}) {
  const coords = { latitude: roundCoord(latitude), longitude: roundCoord(longitude) };
  if (!state.placeWizard) return;
  const reverse = options.skipReverse ? null : await reverseGeocode(coords).catch(() => null);
  const wizard = state.placeWizard;
  const draft = { ...wizard.draft };
  draft.latitude = formatCoordinate(coords.latitude);
  draft.longitude = formatCoordinate(coords.longitude);
  if (reverse) {
    if (!draft.address && reverse.address) draft.address = reverse.address;
    if (!draft.city && reverse.city) draft.city = reverse.city;
    if (!draft.region && reverse.region) draft.region = reverse.region;
  }
  updatePlaceWizard({
    coords,
    currentLocationLabel: reverse && reverse.displayName ? reverse.displayName : options.label || wizard.currentLocationLabel,
    draft
  });
}

async function useCurrentLocation() {
  if (!navigator.geolocation) {
    showToast('Location access is unavailable.');
    return;
  }
  if (!state.placeWizard) return;
  state.placeWizard.loading = true;
  state.placeWizard.error = '';
  render();
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      if (!state.placeWizard) return;
      state.placeWizard.loading = false;
      await setPlaceWizardCoords(position.coords.latitude, position.coords.longitude, { label: 'Current location' });
      await searchWizardNearby();
    },
    (error) => {
      if (!state.placeWizard) return;
      state.placeWizard.loading = false;
      state.placeWizard.error = error.message || 'Could not access location.';
      render();
      showToast(state.placeWizard.error);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
  );
}

async function searchWizardNearby() {
  if (!state.placeWizard) return;
  let coords = parseWizardCoords(state.placeWizard);
  if (!coords) {
    const latInput = document.querySelector('#wizard-latitude');
    const lonInput = document.querySelector('#wizard-longitude');
    const latitude = latInput ? Number(latInput.value) : NaN;
    const longitude = lonInput ? Number(lonInput.value) : NaN;
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      coords = { latitude, longitude };
      await setPlaceWizardCoords(latitude, longitude, { skipReverse: false });
    }
  }
  if (!coords) {
    showToast('Set a location first.');
    return;
  }
  state.placeWizard.loading = true;
  state.placeWizard.error = '';
  render();
  try {
    const results = await searchNearbyPlaces(coords);
    if (!state.placeWizard) return;
    state.placeWizard.results = results;
    state.placeWizard.loading = false;
    state.placeWizard.step = 'results';
    render();
  } catch (error) {
    if (!state.placeWizard) return;
    state.placeWizard.loading = false;
    state.placeWizard.error = error.message || 'Nearby search failed.';
    state.placeWizard.results = [];
    state.placeWizard.step = 'results';
    render();
  }
}

async function chooseWizardResult(resultId) {
  if (!state.placeWizard) return;
  const result = state.placeWizard.results.find((item) => item.id === resultId);
  if (!result) return;
  state.placeWizard.draft = restaurantDraftFromResult(result, {});
  state.placeWizard.selectedResult = result;
  state.placeWizard.step = 'details';
  render();
}

function goToWizardStep(step) {
  if (!state.placeWizard) return;
  state.placeWizard.step = step;
  render();
}

function skipWizardLocation() {
  if (!state.placeWizard) return;
  state.placeWizard.entryMode = 'manual';
  state.placeWizard.coords = null;
  state.placeWizard.currentLocationLabel = '';
  state.placeWizard.results = [];
  state.placeWizard.selectedResult = null;
  state.placeWizard.draft = emptyRestaurantDraft();
  state.placeWizard.error = '';
  state.placeWizard.loading = false;
  state.placeWizard.step = 'details';
  render();
}

async function saveWizardPlace(form) {
  if (!state.placeWizard) return;
  const values = collectForm(form);
  const base = makeEntity();
  const latitude = values.latitude ? Number(values.latitude) : null;
  const longitude = values.longitude ? Number(values.longitude) : null;
  await repository.save('restaurants', {
    ...base,
    name: values.name.trim(),
    address: values.address,
    city: values.city,
    latitude,
    longitude,
    phone: values.phone,
    websiteUrl: values.websiteUrl,
    directionsUrl: values.directionsUrl || (Number.isFinite(latitude) && Number.isFinite(longitude) ? makeMapsUrl(latitude, longitude, values.name) : ''),
    yelpUrl: values.yelpUrl || makeYelpSearchUrl(values.name, values.address, values.city),
    cuisineTags: normalizeList(values.cuisineTags),
    notes: values.notes,
    externalRefs: [
      ...(values.yelpUrl ? [{ provider: 'yelp', providerId: values.yelpUrl, url: values.yelpUrl, lastImportedAt: now() }] : [])
    ]
  });
  closePlaceWizard();
  await refresh('Place saved.');
}

function wizardResultAddress(result) {
  return [result.address, result.city, result.region].filter(Boolean).join(', ') || 'No address';
}

function restaurantDraftFromResult(result, reverse = {}) {
  const latitude = roundCoord(result.latitude);
  const longitude = roundCoord(result.longitude);
  const draft = emptyRestaurantDraft();
  draft.name = result.name || '';
  draft.address = result.address || reverse.address || '';
  draft.city = result.city || reverse.city || '';
  draft.region = result.region || reverse.region || '';
  draft.latitude = Number.isFinite(latitude) ? formatCoordinate(latitude) : '';
  draft.longitude = Number.isFinite(longitude) ? formatCoordinate(longitude) : '';
  draft.phone = result.phone || '';
  draft.websiteUrl = result.website || '';
  draft.directionsUrl = Number.isFinite(latitude) && Number.isFinite(longitude) ? makeMapsUrl(latitude, longitude, result.name || '') : '';
  draft.yelpUrl = makeYelpSearchUrl(result.name || '', draft.address, draft.city);
  draft.cuisineTags = (result.cuisineTags || []).join(', ');
  draft.notes = '';
  return draft;
}

function parseWizardCoords(wizard) {
  const draft = wizard && wizard.draft ? wizard.draft : {};
  const coords = wizard && wizard.coords ? wizard.coords : {};
  const latitude = Number(draft.latitude || coords.latitude);
  const longitude = Number(draft.longitude || coords.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

async function reverseGeocode(coords) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(coords.latitude)}&lon=${encodeURIComponent(coords.longitude)}&addressdetails=1`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });
  if (!response.ok) return null;
  const payload = await response.json();
  const address = payload.address || {};
  return {
    displayName: payload.display_name || '',
    address: [address.house_number, address.road].filter(Boolean).join(' ') || '',
    city: address.city || address.town || address.village || address.hamlet || '',
    region: address.state || address.region || '',
    postcode: address.postcode || ''
  };
}

async function searchNearbyPlaces(coords) {
  if (!coords) return [];
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](around:1500,${coords.latitude},${coords.longitude});
      way["amenity"="restaurant"](around:1500,${coords.latitude},${coords.longitude});
      relation["amenity"="restaurant"](around:1500,${coords.latitude},${coords.longitude});
    );
    out center tags;
  `;
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.openstreetmap.ru/cgi/interpreter'
  ];
  let payload = null;
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8'
        },
        body: query.trim()
      });
      if (!response.ok) {
        lastError = new Error(`Nearby search failed (${response.status}).`);
        continue;
      }
      payload = await response.json();
      if (payload && Array.isArray(payload.elements)) break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!payload || !Array.isArray(payload.elements)) throw lastError || new Error('Nearby search failed.');
  return (payload.elements || [])
    .map((element) => {
      const latitude = Number(element.lat || (element.center && element.center.lat));
      const longitude = Number(element.lon || (element.center && element.center.lon));
      const tags = element.tags || {};
      const address = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
      const city = tags['addr:city'] || '';
      const region = tags['addr:state'] || '';
      const result = {
        id: `${element.type}_${element.id}`,
        name: tags.name || 'Unnamed place',
        address,
        city,
        region,
        latitude,
        longitude,
        phone: tags.phone || tags['contact:phone'] || '',
        website: tags.website || tags['contact:website'] || '',
        cuisineTags: [tags.cuisine, tags.amenity].filter(Boolean),
        distance: Number.isFinite(latitude) && Number.isFinite(longitude)
          ? haversineMeters(coords.latitude, coords.longitude, latitude, longitude)
          : null,
        osmUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`
      };
      result.yelpUrl = makeYelpSearchUrl(result.name, result.address, result.city);
      result.directionsUrl = makeMapsUrl(latitude, longitude, result.name);
      return result;
    })
    .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    .slice(0, 12);
}

function profileForm(record = {}) {
  return `
    <div class="form-grid">
      ${field('Display name', 'displayName', record.displayName, 'text', true)}
      ${field('Relationship', 'relationship', record.relationship, 'text', false, 'Self, partner, child, friend')}
      ${field('Avatar color', 'avatarColor', record.avatarColor || '#275c54', 'color')}
      ${field('Preferences', 'preferences', record.preferences, 'textarea')}
      ${field('Allergies or restrictions', 'allergies', record.allergies, 'textarea')}
      ${field('Notes', 'notes', record.notes, 'textarea')}
    </div>
  `;
}

function dishForm(record = {}) {
  const selectedRestaurant = record.restaurantId || state.modal.restaurantId || state.selectedId;
  return `
    <div class="form-grid">
      ${selectField('Restaurant', 'restaurantId', state.data.restaurants, selectedRestaurant, 'name', true)}
      ${field('Dish name', 'name', record.name, 'text', true)}
      ${selectStatic('Category', 'category', record.category, ['', 'appetizer', 'entree', 'dessert', 'drink', 'side', 'special', 'other'])}
      ${selectStatic('Order again', 'orderAgain', record.orderAgain, ['', 'yes', 'maybe', 'no'])}
      ${ratingField('Default rating', 'defaultRating', record.defaultRating)}
      ${field('Tags', 'tags', (record.tags || []).join(', '), 'text', false, 'spicy, kid-friendly, shareable')}
      ${field('Description', 'description', record.description, 'textarea')}
      ${field('Modifications for next time', 'modificationNotes', record.modificationNotes, 'textarea')}
    </div>
  `;
}

function mealForm(record = {}) {
  const selectedRestaurant = record.restaurantId || state.modal.restaurantId || '';
  return `
    <div class="form-grid">
      ${selectField('Restaurant', 'restaurantId', state.data.restaurants, selectedRestaurant, 'name', true)}
      ${field('Visited at', 'visitedAt', record.visitedAt ? record.visitedAt.slice(0, 16) : todayLocal(), 'datetime-local', true)}
      ${selectStatic('Meal type', 'mealType', record.mealType, ['', 'breakfast', 'brunch', 'lunch', 'dinner', 'snack', 'dessert', 'drinks', 'other'])}
      ${ratingField('Overall rating', 'overallRating', record.overallRating)}
      ${selectStatic('Cost impression', 'costImpression', record.costImpression, ['', 'cheap', 'moderate', 'expensive', 'splurge'])}
      ${field('Occasion tags', 'occasionTags', (record.occasionTags || []).join(', '), 'text', false, 'date night, family, takeout')}
      <div class="field full">
        <label>Attendees</label>
        ${checkboxes('attendeeProfileIds', state.data.profiles, record.attendeeProfileIds || [], 'displayName')}
      </div>
      ${field('Notes', 'notes', record.notes, 'textarea')}
    </div>
  `;
}

function mealDishForm(record = {}) {
  const mealId = record.mealVisitId || state.modal.mealId || state.selectedId;
  const meal = state.data.meals.find((item) => item.id === mealId);
  const dishes = meal ? state.data.dishes.filter((dish) => dish.restaurantId === meal.restaurantId) : state.data.dishes;
  return `
    <input type="hidden" name="mealVisitId" value="${escapeHtml(mealId || '')}" />
    <div class="form-grid">
      ${selectField('Dish', 'dishId', dishes, record.dishId, 'name', true)}
      ${ratingField('Rating', 'rating', record.rating)}
      <div class="field full">
        <label>Eaters</label>
        ${checkboxes('eaterProfileIds', state.data.profiles, record.eaterProfileIds || (meal ? meal.attendeeProfileIds : []) || [], 'displayName')}
      </div>
      ${field('Notes', 'notes', record.notes, 'textarea')}
      ${field('Modifications for next time', 'modificationNotes', record.modificationNotes, 'textarea')}
    </div>
  `;
}

function field(label, name, value = '', type = 'text', required = false, placeholder = '') {
  const isTextArea = type === 'textarea';
  const classes = isTextArea ? 'field full' : 'field';
  const attrs = `name="${name}" id="${name}" ${required ? 'required' : ''} placeholder="${escapeHtml(placeholder)}"`;
  return `
    <div class="${classes}">
      <label for="${name}">${escapeHtml(label)}</label>
      ${isTextArea ? `<textarea ${attrs}>${escapeHtml(value || '')}</textarea>` : `<input type="${type}" ${attrs} value="${escapeHtml(value || '')}" />`}
    </div>
  `;
}

function ratingField(label, name, value = '') {
  return `
    <div class="field">
      <label for="${name}">${escapeHtml(label)}</label>
      <select name="${name}" id="${name}">
        <option value="">Not rated</option>
        ${[1, 2, 3, 4, 5].map((rating) => `<option value="${rating}" ${Number(value) === rating ? 'selected' : ''}>${rating} star${rating === 1 ? '' : 's'}</option>`).join('')}
      </select>
    </div>
  `;
}

function selectField(label, name, options, value, labelKey, required = false) {
  return `
    <div class="field">
      <label for="${name}">${escapeHtml(label)}</label>
      <select name="${name}" id="${name}" ${required ? 'required' : ''}>
        <option value="">Choose ${escapeHtml(label.toLowerCase())}</option>
        ${options.map((option) => `<option value="${option.id}" ${option.id === value ? 'selected' : ''}>${escapeHtml(option[labelKey])}</option>`).join('')}
      </select>
    </div>
  `;
}

function selectStatic(label, name, value, options) {
  return `
    <div class="field">
      <label for="${name}">${escapeHtml(label)}</label>
      <select name="${name}" id="${name}">
        ${options.map((option) => `<option value="${option}" ${option === value ? 'selected' : ''}>${escapeHtml(option || 'None')}</option>`).join('')}
      </select>
    </div>
  `;
}

function checkboxes(name, items, selectedValues, labelKey) {
  if (!items.length) return `<p class="subtle">Add people first, then attach them here.</p>`;
  return `
    <div class="check-grid">
      ${items
        .map(
          (item) => `
            <label class="check-row">
              <input type="checkbox" name="${name}" value="${item.id}" ${selectedValues.includes(item.id) ? 'checked' : ''} />
              <span>${escapeHtml(item[labelKey])}</span>
            </label>
          `
        )
        .join('')}
    </div>
  `;
}

function collectForm(form) {
  const data = new FormData(form);
  const values = Object.fromEntries(data.entries());
  values.attendeeProfileIds = data.getAll('attendeeProfileIds');
  values.eaterProfileIds = data.getAll('eaterProfileIds');
  return values;
}

async function saveFromModal(form) {
  const { type, record } = state.modal;
  const values = collectForm(form);
  const base = record ? { ...record, updatedAt: now() } : makeEntity();

  if (type === 'restaurant') {
    await repository.save('restaurants', {
      ...base,
      name: values.name.trim(),
      address: values.address,
      city: values.city,
      latitude: values.latitude ? Number(values.latitude) : null,
      longitude: values.longitude ? Number(values.longitude) : null,
      phone: values.phone,
      websiteUrl: values.websiteUrl,
      directionsUrl: values.directionsUrl,
      yelpUrl: values.yelpUrl,
      cuisineTags: normalizeList(values.cuisineTags),
      notes: values.notes,
      externalRefs: base.externalRefs || []
    });
  }

  if (type === 'profile') {
    await repository.save('profiles', {
      ...base,
      displayName: values.displayName.trim(),
      relationship: values.relationship,
      avatarColor: values.avatarColor || '#275c54',
      preferences: values.preferences,
      allergies: values.allergies,
      notes: values.notes,
      archived: false
    });
  }

  if (type === 'dish') {
    await repository.save('dishes', {
      ...base,
      restaurantId: values.restaurantId,
      name: values.name.trim(),
      category: values.category,
      description: values.description,
      defaultRating: values.defaultRating ? Number(values.defaultRating) : null,
      orderAgain: values.orderAgain,
      modificationNotes: values.modificationNotes,
      tags: normalizeList(values.tags)
    });
  }

  if (type === 'meal') {
    await repository.save('meals', {
      ...base,
      restaurantId: values.restaurantId,
      visitedAt: new Date(values.visitedAt).toISOString(),
      mealType: values.mealType,
      attendeeProfileIds: values.attendeeProfileIds,
      overallRating: values.overallRating ? Number(values.overallRating) : null,
      costImpression: values.costImpression,
      occasionTags: normalizeList(values.occasionTags),
      notes: values.notes,
      photoIds: base.photoIds || []
    });
  }

  if (type === 'mealDish') {
    await repository.save('mealDishes', {
      ...base,
      mealVisitId: values.mealVisitId,
      dishId: values.dishId,
      eaterProfileIds: values.eaterProfileIds,
      sharedByProfileIds: [],
      rating: values.rating ? Number(values.rating) : null,
      perPersonRatings: [],
      notes: values.notes,
      modificationNotes: values.modificationNotes,
      photoIds: base.photoIds || []
    });
  }

  closeModal();
  await refresh(`Saved ${modalLabel(type)}.`);
}

async function refresh(message) {
  await loadData();
  render();
  if (message) showToast(message);
}

async function deleteRecord(type, idValue) {
  const map = {
    restaurant: 'restaurants',
    profile: 'profiles',
    dish: 'dishes',
    meal: 'meals',
    mealDish: 'mealDishes'
  };
  if (!confirm('Delete this item from your local meal memory?')) return;
  await repository.softDelete(map[type], idValue);
  state.selectedId = null;
  setRoute(type === 'restaurant' ? 'restaurants' : type === 'profile' ? 'people' : type === 'dish' ? 'dishes' : type === 'meal' ? 'meals' : 'home');
  await refresh('Deleted.');
}

async function resizeImage(file, maxSize, quality) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

function exportData() {
  const payload = {
    exportedAt: now(),
    app: 'meal-memory',
    version: SCHEMA_VERSION,
    ...state.data
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `meal-memory-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importData(file) {
  const text = await file.text();
  const payload = JSON.parse(text);
  if (payload.app !== 'meal-memory') throw new Error('This does not look like a Meal Memory backup.');
  if (!confirm('Import this backup and replace the current local data?')) return;
  await repository.clearAndImport(payload);
  await refresh('Backup imported.');
}

function settingsPanel() {
  return `
    <section class="section">
      <div class="card">
        <div class="section-header">
          <div>
            <h2>Backup</h2>
            <p class="muted">Export or restore the local IndexedDB data for this browser.</p>
          </div>
        </div>
        <div class="actions">
          <button type="button" class="button" id="export-data">${icons.download}<span>Export JSON</span></button>
          <label class="button" for="import-data">${icons.upload}<span>Import JSON</span><input class="hidden-file" type="file" accept="application/json" id="import-data" /></label>
        </div>
      </div>
    </section>
  `;
}

function renderPlaceWizard() {
  if (!state.placeWizard) return '';
  const wizard = state.placeWizard;
  const coords = parseWizardCoords(wizard);
  const yelpUrl = wizard.selectedResult ? wizard.selectedResult.yelpUrl : makeYelpSearchUrl(wizard.draft.name, wizard.draft.address, wizard.draft.city);
  const footer = wizard.step === 'location'
    ? `
      <button type="button" class="button ghost" id="wizard-close">Cancel</button>
      <button type="button" class="button ghost" id="wizard-skip-location">Skip location</button>
      <button type="button" class="button primary" id="wizard-next-from-location">Search nearby</button>
    `
    : wizard.step === 'results'
      ? `
        <button type="button" class="button ghost" id="wizard-back-location">Back</button>
        <button type="button" class="button ghost" id="wizard-close">Cancel</button>
      `
      : `
        ${wizard.entryMode === 'manual' ? '<button type="button" class="button ghost" id="wizard-back-location">Back</button>' : '<button type="button" class="button ghost" id="wizard-back-results">Back</button>'}
        <button type="submit" form="wizard-form" class="button primary" id="wizard-save">Save place</button>
      `;

  return `
    <div class="modal-backdrop" role="presentation">
      <section class="modal wizard" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
        <header>
          <div>
            <p class="eyebrow">Add place</p>
            <h2 id="wizard-title">${escapeHtml(wizard.step === 'location' ? 'Location' : wizard.step === 'results' ? 'Nearby' : 'Details')}</h2>
          </div>
          <button class="icon-button" id="wizard-close-icon" aria-label="Close">${icons.close}</button>
        </header>
        <div class="modal-body">
          ${wizard.step === 'location' ? `
            <div class="stack">
              <div class="actions">
                <button type="button" class="button primary" id="wizard-use-current">${icons.pin}<span>Current location</span></button>
                <button type="button" class="button" id="wizard-search-nearby">${icons.search}<span>Find nearby</span></button>
              </div>
              <div class="form-grid">
                ${field('Latitude', 'wizard-latitude', wizard.draft.latitude, 'number')}
                ${field('Longitude', 'wizard-longitude', wizard.draft.longitude, 'number')}
              </div>
              <div class="card wizard-map-card">
                <div id="place-map" class="wizard-map" aria-label="Map"></div>
              </div>
              ${wizard.currentLocationLabel ? `<p class="subtle">${escapeHtml(wizard.currentLocationLabel)}</p>` : ''}
              ${wizard.error ? `<p class="subtle">${escapeHtml(wizard.error)}</p>` : ''}
            </div>
          ` : ''}
          ${wizard.step === 'results' ? `
            <div class="stack">
              <div class="wizard-results">
                ${wizard.loading ? '<div class="empty">Searching nearby places...</div>' : ''}
                ${!wizard.loading && wizard.results.length ? wizard.results.map((result) => wizardResultCard(result, yelpUrl)).join('') : ''}
                ${!wizard.loading && !wizard.results.length ? '<div class="empty">No nearby places found.</div>' : ''}
              </div>
              ${wizard.error ? `<p class="subtle">${escapeHtml(wizard.error)}</p>` : ''}
            </div>
          ` : ''}
          ${wizard.step === 'details' ? `
            <form id="wizard-form">
              ${restaurantForm(wizard.draft)}
            </form>
            <div class="stack" style="margin-top: 14px">
              ${wizard.selectedResult ? `
                <div class="card">
                  <h3>${escapeHtml(wizard.selectedResult.name)}</h3>
                  <p class="subtle">${escapeHtml(wizardResultAddress(wizard.selectedResult))}</p>
                  <div class="actions">
                    <a class="button" href="${escapeHtml(wizard.selectedResult.yelpUrl)}" target="_blank" rel="noreferrer">${icons.search}<span>Open Yelp</span></a>
                    <a class="button" href="${escapeHtml(wizard.selectedResult.directionsUrl)}" target="_blank" rel="noreferrer">${icons.store}<span>Map</span></a>
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
        <footer class="modal-footer">
          ${footer}
        </footer>
      </section>
    </div>
  `;
}

function wizardResultCard(result, yelpFallbackUrl) {
  return `
    <div class="card wizard-result">
      <div>
        <h3>${escapeHtml(result.name)}</h3>
        <p class="subtle">${escapeHtml(wizardResultAddress(result))}</p>
        ${result.distance !== null ? `<p class="subtle">${(result.distance / 1609.34).toFixed(1)} mi away</p>` : ''}
      </div>
      <div class="actions">
        <button type="button" class="button primary" data-place-result-id="${escapeHtml(result.id)}">Select</button>
        <a class="button" href="${escapeHtml(result.yelpUrl || yelpFallbackUrl)}" target="_blank" rel="noreferrer">${icons.search}<span>Yelp</span></a>
      </div>
    </div>
  `;
}

async function initPlaceWizardMap() {
  if (!state.placeWizard || state.placeWizard.step !== 'location') return;
  const wizard = state.placeWizard;
  const mount = document.querySelector('#place-map');
  if (!mount) return;
  const coords = parseWizardCoords(wizard);
  if (!coords) return;

  try {
    const L = await loadLeaflet();
    if (!state.placeWizard || state.placeWizard.step !== 'location') return;
    if (!document.body.contains(mount)) return;
    if (mount.__leafletMap) {
      mount.__leafletMap.remove();
      mount.__leafletMap = null;
    }
    mount.innerHTML = '';
    const map = L.map(mount, { scrollWheelZoom: false }).setView([coords.latitude, coords.longitude], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    const marker = L.marker([coords.latitude, coords.longitude], { draggable: true }).addTo(map);
    map.on('click', (event) => {
      marker.setLatLng(event.latlng);
      setPlaceWizardCoords(event.latlng.lat, event.latlng.lng, { skipReverse: false }).catch(() => {});
    });
    marker.on('dragend', () => {
      const latLng = marker.getLatLng();
      setPlaceWizardCoords(latLng.lat, latLng.lng, { skipReverse: false }).catch(() => {});
    });
    mount.__leafletMap = map;
  } catch (error) {
    mount.textContent = 'Map unavailable';
  }
}

document.addEventListener('click', async (event) => {
  const deleteButton = event.target.closest('[data-delete-type]');
  if (deleteButton) {
    await deleteRecord(deleteButton.dataset.deleteType, deleteButton.dataset.id);
    return;
  }
});

document.addEventListener('submit', async (event) => {
  if (event.target.id === 'wizard-form') {
    event.preventDefault();
    try {
      await saveWizardPlace(event.target);
    } catch (error) {
      showToast(error.message || 'Could not save place.');
    }
    return;
  }
  if (event.target.id !== 'entity-form') return;
  event.preventDefault();
  try {
    await saveFromModal(event.target);
  } catch (error) {
    showToast(error.message || 'Could not save.');
  }
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'global-search') {
    state.query = event.target.value;
    render();
    const input = document.querySelector('#global-search');
    if (input) {
      input.focus();
      input.setSelectionRange(state.query.length, state.query.length);
    }
  }
});

document.addEventListener('change', async (event) => {
  if (event.target.matches('[data-photo-owner-type]')) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      await photoStorage.put(file, event.target.dataset.photoOwnerType, event.target.dataset.photoOwnerId);
      await refresh('Photo saved locally.');
    } catch (error) {
      showToast(error.message || 'Photo upload failed.');
    }
  }

  if (event.target.id === 'import-data') {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      await importData(file);
    } catch (error) {
      showToast(error.message || 'Import failed.');
    }
  }
});

function findRecord(type, idValue) {
  const map = {
    restaurant: state.data.restaurants,
    profile: state.data.profiles,
    dish: state.data.dishes,
    meal: state.data.meals,
    mealDish: state.data.mealDishes
  };
  return map[type] ? map[type].find((item) => item.id === idValue) || null : null;
}

window.addEventListener('hashchange', () => {
  const parsed = parseRoute();
  state.route = parsed.route;
  state.selectedId = parsed.selectedId;
  render();
});

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  state.deferredInstallPrompt = event;
  render();
});

window.addEventListener('appinstalled', () => {
  state.deferredInstallPrompt = null;
  showToast('Installed to your device.');
});

async function seedIfEmpty() {
  const restaurants = await repository.list('restaurants');
  if (restaurants.length) return;

  const self = makeEntity({
    displayName: 'Self',
    relationship: 'Self',
    avatarColor: '#275c54',
    preferences: '',
    allergies: '',
    notes: '',
    archived: false
  });
  await repository.save('profiles', self);
}

async function boot() {
  const parsed = parseRoute();
  state.route = parsed.route;
  state.selectedId = parsed.selectedId;
  await seedIfEmpty();
  await loadData();
  render();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

}

boot().catch((error) => {
  app.innerHTML = `<div class="boot-screen"><p>Meal Memory could not start.</p><p class="muted">${escapeHtml(error.message)}</p></div>`;
});

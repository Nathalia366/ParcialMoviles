const API_BASE = 'http://127.0.0.1:8080/datos';

// ── DOM Referencias ──────────────────────────
const cardList      = document.getElementById('cardList');
const loadingState  = document.getElementById('loadingState');
const errorState    = document.getElementById('errorState');
const errorMsg      = document.getElementById('errorMsg');
const countBadge    = document.getElementById('countBadge');
const searchInput   = document.getElementById('searchInput');
const searchBtn     = document.getElementById('searchBtn');
const searchResult  = document.getElementById('searchResult');
const refreshBtn    = document.getElementById('refreshBtn');
const retryBtn      = document.getElementById('retryBtn');
const clock         = document.getElementById('clock');


function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  clock.textContent = `${h}:${m}`;
}
updateClock();
setInterval(updateClock, 10_000);




function initials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase();
}


function buildCard(p, highlight = false) {
  const card = document.createElement('div');
  card.className = 'person-card' + (highlight ? ' highlight' : '');
  card.innerHTML = `
    <div class="card-top">
      <div class="avatar">${initials(p.nombre ?? p.name ?? '')}</div>
      <div class="card-identity">
        <p class="card-name">${p.nombre ?? p.name ?? '—'}</p>
        <span class="card-id-tag">#${p.id}</span>
      </div>
    </div>
    <div class="card-divider"></div>
    <div class="card-info">
      <div class="info-row">
        <div class="info-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <div class="info-content">
          <p class="info-label">Edad</p>
          <p class="info-value">${p.edad ?? '—'} años</p>
        </div>
      </div>
      <div class="info-row">
        <div class="info-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div class="info-content">
          <p class="info-label">Correo</p>
          <p class="info-value">${p.correo ?? p.email ?? '—'}</p>
        </div>
      </div>
      <div class="info-row">
        <div class="info-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="info-content">
          <p class="info-label">Telefono</p>
          <p class="info-value">${p.telefono ?? p.phone ?? '—'}</p>
        </div>
      </div>
    </div>
  `;
  return card;
}


function setState(state) {
  loadingState.style.display = state === 'loading' ? '' : 'none';
  errorState.classList.toggle('hidden', state !== 'error');
  cardList.style.display = state === 'list' ? '' : 'none';
}

async function loadAll() {
  setState('loading');
  refreshBtn.classList.add('spinning');
  cardList.innerHTML = '';
  searchResult.innerHTML = '';
  searchResult.classList.add('hidden');
  countBadge.textContent = '—';

  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const list = Array.isArray(data) ? data : (data.datos ?? data.data ?? []);

    countBadge.textContent = list.length;
    list.forEach(p => cardList.appendChild(buildCard(p)));
    setState('list');

  } catch (err) {
    console.error('Error cargando datos:', err);
    errorMsg.textContent = `No se pudo conectar al servidor. (${err.message})`;
    setState('error');
  } finally {
    refreshBtn.classList.remove('spinning');
  }
}


async function searchById(id) {
  searchResult.classList.add('hidden');
  searchResult.innerHTML = '';

  if (!id || isNaN(id)) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`);

    if (res.status === 404) {
      searchResult.innerHTML = `
        <div class="not-found-msg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          No existe ninguna persona con el ID <strong>${id}</strong>.
        </div>`;
      searchResult.classList.remove('hidden');
      return;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const person = await res.json();

    const p = person.id ? person : (person.dato ?? person.data ?? person);

    searchResult.appendChild(buildCard(p, true));
    searchResult.classList.remove('hidden');

  } catch (err) {
    console.error('Error buscando ID:', err);
    searchResult.innerHTML = `
      <div class="not-found-msg">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Error al buscar: ${err.message}
      </div>`;
    searchResult.classList.remove('hidden');
  }
}


searchBtn.addEventListener('click', () => {
  searchById(searchInput.value.trim());
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchById(searchInput.value.trim());
});

// Limpiar resultado si se borra el input
searchInput.addEventListener('input', () => {
  if (!searchInput.value) {
    searchResult.innerHTML = '';
    searchResult.classList.add('hidden');
  }
});

refreshBtn.addEventListener('click', loadAll);
retryBtn.addEventListener('click', loadAll);

// ── Init ─────────────────────────────────────
loadAll();

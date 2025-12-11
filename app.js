// 🎵 HITBACK QR Generator - SOLO FORMATO NUEVO ESCALABLE
// ✅ Formato único: HITBACK_TYPE:SONG_DIFF:EASY_GENRE:ROCK_DECADE:1980s
// 🎯 60 cartas físicas → 300 canciones backend → Selección aleatoria inteligente

// 🌍 CONFIGURACIÓN DE AMBIENTES
const ENVIRONMENTS = {
  local: {
    name: 'LOCAL',
    url: 'http://localhost:3000',
    icon: '🏠'
  },
  dev: {
    name: 'DEVELOPMENT',
    url: 'http://192.168.1.10:3000', // ← CAMBIA TU IP AQUÍ
    icon: '🔧'
  },
  prod: {
    name: 'PRODUCTION',
    url: 'https://api.hitback.com',
    icon: '🚀'
  }
};

// 📊 ESTADO GLOBAL
const AppState = {
  currentMode: 'hybrid',
  currentEnvironment: 'dev',
  tracks: [],
  cards: [],
  isLoading: false,
  lastSync: null,
  newTracksFound: 0,

  get currentBackendUrl() {
    return ENVIRONMENTS[this.currentEnvironment].url;
  },

  get environmentName() {
    return ENVIRONMENTS[this.currentEnvironment].name;
  },

  get statusIcon() {
    return ENVIRONMENTS[this.currentEnvironment].icon;
  }
};

// 📋 CONFIGURACIÓN DE 60 CARTAS FÍSICAS
const DECK_CONFIG = [
  // === SONG EASY (15 cartas) ===
  { type: 'SONG', diff: 'EASY', genre: 'ANY', decade: 'ANY', count: 5 },
  { type: 'SONG', diff: 'EASY', genre: 'ROCK', decade: 'ANY', count: 3 },
  { type: 'SONG', diff: 'EASY', genre: 'POP', decade: 'ANY', count: 3 },
  { type: 'SONG', diff: 'EASY', genre: 'ANY', decade: '1980s', count: 2 },
  { type: 'SONG', diff: 'EASY', genre: 'ANY', decade: '2010s', count: 2 },

  // === SONG MEDIUM (12 cartas) ===
  { type: 'SONG', diff: 'MEDIUM', genre: 'ANY', decade: 'ANY', count: 4 },
  { type: 'SONG', diff: 'MEDIUM', genre: 'ROCK', decade: 'ANY', count: 3 },
  { type: 'SONG', diff: 'MEDIUM', genre: 'REGGAETON', decade: 'ANY', count: 3 },
  { type: 'SONG', diff: 'MEDIUM', genre: 'ANY', decade: '1990s', count: 2 },

  // === SONG HARD (8 cartas) ===
  { type: 'SONG', diff: 'HARD', genre: 'ANY', decade: 'ANY', count: 3 },
  { type: 'SONG', diff: 'HARD', genre: 'ROCK', decade: 'ANY', count: 2 },
  { type: 'SONG', diff: 'HARD', genre: 'ELECTRONIC', decade: 'ANY', count: 2 },
  { type: 'SONG', diff: 'HARD', genre: 'ANY', decade: '1970s', count: 1 },

  // === ARTIST (10 cartas) ===
  { type: 'ARTIST', diff: 'EASY', genre: 'ANY', decade: 'ANY', count: 3 },
  { type: 'ARTIST', diff: 'MEDIUM', genre: 'ROCK', decade: 'ANY', count: 3 },
  { type: 'ARTIST', diff: 'HARD', genre: 'ANY', decade: 'ANY', count: 2 },
  { type: 'ARTIST', diff: 'HARD', genre: 'REGGAETON', decade: 'ANY', count: 2 },

  // === DECADE (8 cartas) ===
  { type: 'DECADE', diff: 'EASY', genre: 'ANY', decade: 'ANY', count: 2 },
  { type: 'DECADE', diff: 'MEDIUM', genre: 'ANY', decade: 'ANY', count: 3 },
  { type: 'DECADE', diff: 'HARD', genre: 'ANY', decade: 'ANY', count: 3 },

  // === LYRICS (5 cartas) ===
  { type: 'LYRICS', diff: 'MEDIUM', genre: 'ANY', decade: 'ANY', count: 2 },
  { type: 'LYRICS', diff: 'HARD', genre: 'ANY', decade: 'ANY', count: 3 },

  // === CHALLENGE (2 cartas) ===
  { type: 'CHALLENGE', diff: 'MEDIUM', genre: 'ANY', decade: 'ANY', count: 2 }
];

// 🎨 ICONOS Y COLORES
const CARD_ICONS = {
  SONG: '🎵',
  ARTIST: '🎤',
  DECADE: '📅',
  LYRICS: '📝',
  CHALLENGE: '🔥'
};

const CARD_COLORS = {
  SONG: '#3b82f6',
  ARTIST: '#ec4899',
  DECADE: '#8b5cf6',
  LYRICS: '#f59e0b',
  CHALLENGE: '#ef4444'
};

// 🏭 CLASE PRINCIPAL
class ScalableQRGenerator {
  constructor() {
    this.qrService = new QRCodeService();
    this.backendService = new BackendService();
    this.uiManager = new UIManager();

    console.log('🎵 HITBACK QR Generator - Formato Nuevo Escalable');
  }

  async initialize() {
    try {
      console.log('🚀 Inicializando aplicación...');

      // 1. Cargar tracks del backend
      await this.loadTracks();

      // 2. Generar 60 cartas
      AppState.cards = this.qrService.generateDeck();

      // 3. Actualizar UI
      this.uiManager.updateStatus();
      this.uiManager.updateStats();

      // 4. Renderizar cartas
      await this.generateAllQRs();

      console.log('✅ Aplicación inicializada exitosamente');

    } catch (error) {
      console.error('❌ Error en inicialización:', error);
      this.handleError(error);
    }
  }

  async loadTracks() {
    AppState.isLoading = true;
    this.uiManager.showLoading('Cargando tracks desde backend...');

    try {
      switch (AppState.currentMode) {
        case 'static':
          AppState.tracks = this.getStaticTracks();
          console.log('📱 Modo estático: usando tracks locales');
          break;

        case 'dynamic':
          AppState.tracks = await this.backendService.fetchTracks();
          console.log('🌐 Modo dinámico: tracks desde backend');
          break;

        case 'hybrid':
        default:
          try {
            AppState.tracks = await this.backendService.fetchTracks();
            console.log(`🔄 Modo híbrido: ${AppState.tracks.length} tracks desde backend`);
          } catch (error) {
            console.warn('⚠️ Backend no disponible, usando tracks estáticos');
            AppState.tracks = this.getStaticTracks();
          }
          break;
      }

      console.log(`✅ ${AppState.tracks.length} tracks cargados`);

    } catch (error) {
      console.warn('⚠️ Error cargando tracks, usando fallback');
      AppState.tracks = this.getStaticTracks();
    } finally {
      AppState.isLoading = false;
    }
  }

  getStaticTracks() {
    return [
      {
        id: "001",
        title: "Don't Stop Believin'",
        artist: "Journey",
        genre: "ROCK",
        decade: "1980s",
        difficulty: "EASY"
      },
      {
        id: "121",
        title: "Despacito",
        artist: "Luis Fonsi ft. Daddy Yankee",
        genre: "REGGAETON",
        decade: "2010s",
        difficulty: "EASY"
      }
    ];
  }

  async syncFromBackend() {
    try {
      AppState.isLoading = true;
      this.uiManager.showLoading('🔄 Sincronizando con backend...');

      console.log(`🔄 Conectando a: ${AppState.currentBackendUrl}/api/tracks`);

      const backendTracks = await this.backendService.fetchTracks();
      const currentIds = AppState.tracks.map(t => t.id);
      const newTracks = backendTracks.filter(t => !currentIds.includes(t.id));

      AppState.tracks = backendTracks;
      AppState.newTracksFound = newTracks.length;
      AppState.lastSync = new Date().toLocaleString();

      if (newTracks.length > 0) {
        console.log(`✅ ${newTracks.length} nuevas canciones encontradas`);
        this.uiManager.showNewTracksModal(newTracks);
      } else {
        console.log(`✅ Sincronización completa: ${backendTracks.length} tracks`);
        alert(`✅ Sincronización exitosa!\n\n${backendTracks.length} canciones en backend\n${newTracks.length} nuevas canciones`);
      }

      this.uiManager.updateStatus();
      this.uiManager.updateStats();

    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      alert(`❌ Error al sincronizar:\n\n${error.message}\n\nVerifica que el backend esté corriendo en:\n${AppState.currentBackendUrl}`);
    } finally {
      AppState.isLoading = false;
    }
  }

  async generateAllQRs() {
    try {
      AppState.isLoading = true;
      this.uiManager.showLoading('🎯 Generando 60 QR codes...');

      const qrGrid = document.getElementById('qrGrid');
      const qrHTML = AppState.cards.map(card => this.createQRCard(card)).join('');
      qrGrid.innerHTML = qrHTML;

      document.getElementById('statsPanel').style.display = 'block';

      console.log(`✅ ${AppState.cards.length} QR codes generados`);

    } catch (error) {
      console.error('❌ Error generando QRs:', error);
      this.handleError(error);
    } finally {
      AppState.isLoading = false;
    }
  }

  createQRCard(card) {
    const icon = CARD_ICONS[card.type];
    const color = CARD_COLORS[card.type];
    const difficultyDots = this.getDifficultyDots(card.diff);
    const estimatedPool = this.estimatePoolSize(card);

    return `
      <div class="qr-card" data-card-number="${card.number}">
        <div class="track-header">
          <div class="track-title">${icon} Carta #${card.number} - ${card.type}</div>
          <div class="track-artist">${difficultyDots} ${card.diff}</div>
        </div>
        
        <div class="status-badges">
          <div class="success-badge" style="background: ${color};">✅ ${card.type}</div>
          <div class="mode-badge">${AppState.statusIcon} ${AppState.environmentName}</div>
          <div class="audio-indicator">🎸 ${card.genre}</div>
          <div class="audio-indicator">🕰️ ${card.decade}</div>
        </div>
        
        <div class="qr-image">
          <img src="${card.qrImageUrl}" 
               alt="${card.qrString}" 
               width="250" 
               height="250"
               loading="lazy" />
        </div>
        
        <div class="qr-code">${card.qrString}</div>
        
        <div class="track-details">
          <p><strong>Tipo:</strong> ${card.type}</p>
          <p><strong>Dificultad:</strong> ${card.diff}</p>
          <p><strong>Género:</strong> ${card.genre}</p>
          <p><strong>Década:</strong> ${card.decade}</p>
          <p><strong>Pool estimado:</strong> ~${estimatedPool} canciones</p>
          <p><strong>Formato:</strong> <span class="format-badge">NUEVO ESCALABLE</span></p>
          <p><strong>Endpoint:</strong> <span class="endpoint-url">${AppState.currentBackendUrl}/api/qr/scan/${encodeURIComponent(card.qrString)}</span></p>
        </div>
        
        <div class="card-actions">
          <a href="${card.qrImageUrl}" 
             download="HITBACK_Card_${String(card.number).padStart(2, '0')}.png" 
             class="btn btn-download">
            💾 Descargar
          </a>
          <button class="btn btn-primary" 
                  onclick="copyToClipboard('${card.qrString.replace(/'/g, "\\'")}')">
            📋 Copiar
          </button>
          <button class="btn btn-secondary" 
                  onclick="testEndpoint('${AppState.currentBackendUrl}/api/qr/scan/${encodeURIComponent(card.qrString)}')">
            🧪 Test
          </button>
        </div>
      </div>
    `;
  }

  getDifficultyDots(difficulty) {
    const dots = {
      EASY: '●',
      MEDIUM: '●●',
      HARD: '●●●',
      EXPERT: '●●●●',
      ANY: '○'
    };
    return dots[difficulty] || '○';
  }

  estimatePoolSize(card) {
    const basePool = AppState.tracks.length || 300;
    let filters = 0;
    if (card.diff !== 'ANY') filters++;
    if (card.genre !== 'ANY') filters++;
    if (card.decade !== 'ANY') filters++;
    const reductionFactor = 0.3;
    const estimated = Math.floor(basePool * Math.pow((1 - reductionFactor), filters));
    return Math.max(estimated, 5);
  }

  handleError(error) {
    const qrGrid = document.getElementById('qrGrid');
    qrGrid.innerHTML = `
      <div class="error-state">
        <h3>❌ Error</h3>
        <p class="error-message">${error.message}</p>
        <div class="error-actions">
          <button onclick="app.initialize()" class="btn btn-primary">
            🔄 Reintentar
          </button>
          <button onclick="setMode('static'); app.initialize();" class="btn">
            📱 Usar Modo Estático
          </button>
        </div>
      </div>
    `;
  }
}

// 🔧 SERVICIO DE QR CODES - SOLO FORMATO NUEVO
class QRCodeService {
  constructor() {
    this.qrApiBase = 'https://api.qrserver.com/v1/create-qr-code/';
    this.generatedCards = [];
  }

  // ✅ GENERAR QR CODE - FORMATO NUEVO ESCALABLE
  // Formato: HITBACK_TYPE:SONG_DIFF:EASY_GENRE:ROCK_DECADE:1980s
  generateQRCode(cardConfig) {
    const { type, diff, genre, decade } = cardConfig;
    return `HITBACK_TYPE:${type}_DIFF:${diff}_GENRE:${genre}_DECADE:${decade}`;
  }

  generateDeck() {
    this.generatedCards = [];
    let cardNumber = 1;

    DECK_CONFIG.forEach(config => {
      for (let i = 0; i < config.count; i++) {
        const card = {
          number: cardNumber++,
          type: config.type,
          diff: config.diff,
          genre: config.genre,
          decade: config.decade,
          qrString: this.generateQRCode(config)
        };

        card.qrImageUrl = this.generateQRImageURL(card.qrString);
        this.generatedCards.push(card);
      }
    });

    console.log(`✅ ${this.generatedCards.length} cartas generadas (formato nuevo)`);
    return this.generatedCards;
  }

  generateQRImageURL(qrCode) {
    const params = new URLSearchParams({
      size: '300x300',
      data: qrCode,
      format: 'png',
      margin: '20',
      qzone: '1',
      color: '0f172a',
      bgcolor: 'ffffff'
    });

    return `${this.qrApiBase}?${params.toString()}`;
  }
}

// 🌐 SERVICIO DE BACKEND
class BackendService {
  constructor() {
    this.retries = 3;
    this.timeout = 10000;
  }

  async fetchTracks() {
    const url = `${AppState.currentBackendUrl}/api/tracks`;

    console.log(`📡 GET ${url}`);

    const response = await this.fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 Respuesta del backend:', data);

    return this.extractTracks(data);
  }

  async fetchWithRetry(url, options) {
    let lastError;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        console.log(`🔄 Intento ${attempt}/${this.retries}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log(`✅ Éxito en intento ${attempt}`);
          return response;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Intento ${attempt} falló:`, error.message);

        if (attempt < this.retries) {
          await this.delay(attempt * 1000);
        }
      }
    }

    throw lastError;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  extractTracks(data) {
    if (data.success && data.data && Array.isArray(data.data.tracks)) {
      return data.data.tracks;
    }

    if (Array.isArray(data.tracks)) {
      return data.tracks;
    }

    if (Array.isArray(data)) {
      return data;
    }

    console.error('Formato de respuesta inesperado:', data);
    throw new Error('Formato de respuesta inválido del backend');
  }
}

// 🎨 MANAGER DE UI
class UIManager {
  updateStatus() {
    const statusBar = document.getElementById('statusBar');
    if (statusBar) {
      statusBar.innerHTML = `
        ${AppState.statusIcon} Ambiente: ${AppState.environmentName} | 
        🎯 Modo: ${AppState.currentMode.toUpperCase()} |
        🎴 ${AppState.cards.length} cartas |
        📱 ${AppState.tracks.length} tracks |
        🔄 Última sync: ${AppState.lastSync || 'Nunca'} |
        ✅ Formato: NUEVO ESCALABLE
      `;
    }
  }

  updateStats() {
    document.getElementById('totalTracks').textContent = AppState.tracks.length;
    document.getElementById('newTracks').textContent = AppState.newTracksFound;
    document.getElementById('qrGenerated').textContent = AppState.cards.length;
    document.getElementById('lastSync').textContent = AppState.lastSync || 'Nunca';
  }

  showLoading(message) {
    const qrGrid = document.getElementById('qrGrid');
    qrGrid.innerHTML = `
      <div class="loading-state">
        <h3>${message}</h3>
        <div class="loading-spinner"></div>
      </div>
    `;
  }

  showNewTracksModal(newTracks) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>🎉 ¡${newTracks.length} Nuevas Canciones!</h2>
        <div class="new-tracks-list">
          ${newTracks.slice(0, 10).map(track => `
            <div class="new-track-item">
              <strong>${track.title}</strong> - ${track.artist}
              <span class="track-id">ID: ${track.id}</span>
            </div>
          `).join('')}
          ${newTracks.length > 10 ? `<p>... y ${newTracks.length - 10} más</p>` : ''}
        </div>
        <div class="modal-actions">
          <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-primary">
            ✅ Entendido
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }
}

// 🌍 FUNCIONES GLOBALES

function setMode(mode) {
  AppState.currentMode = mode;

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`${mode}Btn`).classList.add('active');

  console.log(`🔄 Modo cambiado a: ${mode}`);
  app.loadTracks().then(() => {
    app.uiManager.updateStatus();
    app.uiManager.updateStats();
  });
}

function changeEnvironment() {
  const select = document.getElementById('environmentSelect');
  AppState.currentEnvironment = select.value;

  console.log(`🌍 Ambiente cambiado a: ${AppState.environmentName}`);
  console.log(`📍 URL: ${AppState.currentBackendUrl}`);
  app.uiManager.updateStatus();
}

function syncFromBackend() {
  app.syncFromBackend();
}

function generateAllQRs() {
  app.generateAllQRs();
}

function downloadAllQRs() {
  if (!confirm('📦 Esto descargará las 60 cartas.\n\n¿Continuar?')) {
    return;
  }

  AppState.cards.forEach((card, index) => {
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = card.qrImageUrl;
      link.download = `HITBACK_Card_${String(card.number).padStart(2, '0')}.png`;
      link.click();
    }, index * 300);
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`✅ Copiado:\n${text}`);
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert(`✅ Copiado:\n${text}`);
  });
}

async function testEndpoint(endpoint) {
  try {
    console.log(`🧪 Testing: ${endpoint}`);

    const response = await fetch(endpoint, { method: 'POST' });
    const data = await response.json();

    if (data.success) {
      alert(`✅ Endpoint funcionando!\n\nTrack: ${data.data.track.title}\nArtista: ${data.data.track.artist}\nTipo: ${data.data.question.type}\nPregunta: ${data.data.question.question}\n\nPool aplicado:\n  Género: ${data.data.scan.filters.genre || 'ANY'}\n  Década: ${data.data.scan.filters.decade || 'ANY'}`);
    } else {
      alert(`⚠️ Respuesta:\n${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    alert(`❌ Error en endpoint:\n${error.message}\n\nVerifica que el backend esté corriendo.`);
  }
}

// 🚀 INICIALIZACIÓN
let app;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎵 HITBACK QR Generator - Formato Nuevo Escalable');
  console.log('✅ Solo acepta: HITBACK_TYPE:SONG_DIFF:EASY_GENRE:ROCK_DECADE:1980s');
  console.log('🏗️ Inicializando...');

  app = new ScalableQRGenerator();
  await app.initialize();

  console.log('🎉 ¡Aplicación lista!');
});
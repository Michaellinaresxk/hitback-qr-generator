// 🎵 HITBACK QR Generator - VERSIÓN ESCALABLE Y CLEAN CODE
// 🏗️ Arquitectura: Híbrido (Estático + Dinámico) con Clean Code principles

// 🌍 CONFIGURACIÓN DE AMBIENTES - Escalable para producción
const ENVIRONMENTS = {
  local: {
    name: 'LOCAL',
    url: 'http://localhost:3000',
    icon: '🏠'
  },
  dev: {
    name: 'DEVELOPMENT',
    url: 'http://192.168.1.10:3000',
    icon: '🔧'
  },
  prod: {
    name: 'PRODUCTION',
    url: 'https://api.hitback.com', // 🔄 Cambiar por tu dominio real
    icon: '🚀'
  }
};

// 📊 ESTADO GLOBAL DE LA APLICACIÓN
const AppState = {
  currentMode: 'hybrid', // 'static', 'hybrid', 'dynamic'
  currentEnvironment: 'dev',
  tracks: [],
  isLoading: false,
  lastSync: null,
  newTracksFound: 0,

  // 📱 Getters
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

// 📋 TRACKS ESTÁTICOS - Base de datos local escalable
// ✅ Estos SIEMPRE funcionarán, sin importar el estado del backend
const STATIC_TRACKS = [
  {
    id: "001",
    title: "Despacito",
    artist: "Luis Fonsi ft. Daddy Yankee",
    album: "Vida",
    year: 2017,
    genre: "Reggaeton",
    audioFile: "001_despacito.mp3"
  },
  {
    id: "002",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    year: 1975,
    genre: "Rock",
    audioFile: "002_bohemian_rhapsody.mp3"
  },
  {
    id: "003",
    title: "Rock the Night",
    artist: "Europe",
    album: "The Final Countdown",
    year: 1986,
    genre: "Hard Rock/Glam Metal",
    audioFile: "003_rock_night.mp3"
  },
  {
    id: "004",
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars",
    album: "Uptown Special",
    year: 2014,
    genre: "Funk/Pop",
    audioFile: "004_uptown_funk.mp3"
  },
  {
    id: "005",
    title: "Enjoy the Silence",
    artist: "Depeche Mode",
    album: "Violator",
    year: 1990,
    genre: "Electronic/Synth-pop",
    audioFile: "005_enjoy_the_silence.mp3"
  },
  {
    id: "006",
    title: "Sharp Dressed Man",
    artist: "ZZ Top",
    album: "Eliminator",
    year: 1983,
    genre: "Rock/Blues Rock",
    audioFile: "006_sharp_dressed_man.mp3"
  },
  {
    id: "007",
    title: "Don't Stop Believin'",
    artist: "Journey",
    album: "Escape",
    year: 1981,
    genre: "Rock/Arena Rock",
    audioFile: "007_dont_stop_believing.mp3"
  },
  {
    id: "008",
    title: "Money",
    artist: "Pink Floyd",
    album: "The Dark Side of the Moon",
    year: 1973,
    genre: "Progressive Rock",
    audioFile: "008_money.mp3"
  },
  {
    id: "009",
    title: "Born to Be Wild",
    artist: "Steppenwolf",
    album: "Steppenwolf",
    year: 1968,
    genre: "Hard Rock",
    audioFile: "009_born_to_be_wild.mp3"
  },
  {
    id: "010",
    title: "You Really Got Me",
    artist: "The Kinks",
    album: "The Kinks",
    year: 1964,
    genre: "Rock/Proto-punk",
    audioFile: "006_you_really_got_me.mp3"
  }
];

// 🏭 CLASE PRINCIPAL - Clean Architecture Pattern
class ScalableQRGenerator {
  constructor() {
    this.qrService = new QRCodeService();
    this.backendService = new BackendService();
    this.trackManager = new TrackManager();
    this.uiManager = new UIManager();

    console.log('🎵 HITBACK QR Generator - Versión Escalable iniciada');
  }

  // 🚀 INICIALIZAR APLICACIÓN
  async initialize() {
    try {
      console.log('🚀 Inicializando aplicación...');

      // 1. Cargar tracks según el modo
      await this.loadTracks();

      // 2. Actualizar UI
      this.uiManager.updateStatus();
      this.uiManager.updateStats();

      // 3. Generar QRs iniciales
      await this.generateAllQRs();

      console.log('✅ Aplicación inicializada exitosamente');

    } catch (error) {
      console.error('❌ Error en inicialización:', error);
      this.handleError(error);
    }
  }

  // 🔄 CARGAR TRACKS SEGÚN EL MODO
  async loadTracks() {
    AppState.isLoading = true;
    this.uiManager.showLoading('Cargando tracks...');

    try {
      switch (AppState.currentMode) {
        case 'static':
          AppState.tracks = [...STATIC_TRACKS];
          console.log('📱 Modo estático: usando tracks locales');
          break;

        case 'dynamic':
          AppState.tracks = await this.backendService.fetchTracks();
          console.log('🌐 Modo dinámico: tracks desde backend');
          break;

        case 'hybrid':
        default:
          // Intentar backend, fallback a estático
          try {
            AppState.tracks = await this.backendService.fetchTracks();
            console.log('🔄 Modo híbrido: tracks desde backend');
          } catch (error) {
            console.warn('⚠️ Backend no disponible, usando tracks estáticos');
            AppState.tracks = [...STATIC_TRACKS];
          }
          break;
      }

    } catch (error) {
      console.warn('⚠️ Error cargando tracks, usando fallback estático');
      AppState.tracks = [...STATIC_TRACKS];
    } finally {
      AppState.isLoading = false;
    }
  }

  // 🔄 SINCRONIZAR DESDE BACKEND - Función clave para escalabilidad
  async syncFromBackend() {
    try {
      AppState.isLoading = true;
      this.uiManager.showLoading('🔄 Sincronizando nuevas canciones...');

      console.log('🔄 Iniciando sincronización desde backend...');

      // 1. Obtener tracks actuales del backend
      const backendTracks = await this.backendService.fetchTracks();

      // 2. Comparar con tracks existentes para encontrar nuevos
      const currentIds = AppState.tracks.map(t => t.id);
      const newTracks = backendTracks.filter(t => !currentIds.includes(t.id));

      // 3. Actualizar estado
      AppState.tracks = backendTracks;
      AppState.newTracksFound = newTracks.length;
      AppState.lastSync = new Date().toLocaleString();

      // 4. Mostrar resultados
      if (newTracks.length > 0) {
        console.log(`✅ ${newTracks.length} nuevas canciones encontradas:`);
        newTracks.forEach(track => {
          console.log(`  🎵 ${track.title} - ${track.artist} (ID: ${track.id})`);
        });

        // Mostrar modal con nuevas canciones
        this.uiManager.showNewTracksModal(newTracks);
      } else {
        console.log('ℹ️ No se encontraron nuevas canciones');
        alert('ℹ️ No hay nuevas canciones en el backend');
      }

      // 5. Regenerar QRs
      await this.generateAllQRs();

      // 6. Actualizar UI
      this.uiManager.updateStatus();
      this.uiManager.updateStats();

    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      alert(`❌ Error al sincronizar: ${error.message}`);
    } finally {
      AppState.isLoading = false;
    }
  }

  // 🎯 GENERAR TODOS LOS QRs
  async generateAllQRs() {
    try {
      AppState.isLoading = true;
      this.uiManager.showLoading('🎯 Generando QRs...');

      const qrGrid = document.getElementById('qrGrid');
      const qrHTML = AppState.tracks.map(track => this.createQRCard(track)).join('');

      qrGrid.innerHTML = qrHTML;

      // Mostrar estadísticas
      document.getElementById('statsPanel').style.display = 'block';

      console.log(`✅ ${AppState.tracks.length} QRs generados exitosamente`);

    } catch (error) {
      console.error('❌ Error generando QRs:', error);
      this.handleError(error);
    } finally {
      AppState.isLoading = false;
    }
  }

  // 🎨 CREAR TARJETA DE QR - Mejorada con clean code
  createQRCard(track) {
    const qrCode = this.qrService.generateQRCode(track.id);
    const qrImageUrl = this.qrService.generateQRImageURL(qrCode);
    const endpoint = this.qrService.generateEndpoint(track.id, AppState.currentBackendUrl);

    return `
      <div class="qr-card" data-track-id="${track.id}">
        <div class="track-header">
          <div class="track-title">${track.title}</div>
          <div class="track-artist">${track.artist}</div>
        </div>
        
        <div class="status-badges">
          <div class="success-badge">✅ QR-${track.id}</div>
          <div class="mode-badge">${AppState.statusIcon} ${AppState.environmentName}</div>
          ${track.audioFile ? '<div class="audio-indicator">🎵 Audio OK</div>' : ''}
        </div>
        
        <div class="qr-image">
          <img src="${qrImageUrl}" 
               alt="${qrCode}" 
               width="250" 
               height="250"
               loading="lazy"
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjc3NDhiIj5RUiBFcnJvcjwvdGV4dD48L3N2Zz4='" />
        </div>
        
        <div class="qr-code">${qrCode}</div>
        
        <div class="track-details">
          <p><strong>Álbum:</strong> ${track.album || 'N/A'}</p>
          <p><strong>Año:</strong> ${track.year || 'N/A'}</p>
          <p><strong>Género:</strong> ${track.genre || 'N/A'}</p>
          <p><strong>Audio:</strong> ${track.audioFile || 'N/A'}</p>
          <p><strong>Endpoint:</strong> <span class="endpoint-url">${endpoint}</span></p>
        </div>
        
        <div class="card-actions">
          <a href="${qrImageUrl}" 
             download="HITBACK_${track.id}_QR.png" 
             class="btn btn-download">
            💾 Descargar QR
          </a>
          <button class="btn btn-primary" 
                  onclick="copyToClipboard('${qrCode}')">
            📋 Copiar Código
          </button>
          <button class="btn btn-secondary" 
                  onclick="testEndpoint('${endpoint}')">
            🧪 Test Endpoint
          </button>
        </div>
      </div>
    `;
  }

  // 🎨 MANEJAR ERRORES
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

// 🔧 SERVICIO DE QR CODES - Single Responsibility Principle
class QRCodeService {
  constructor() {
    this.qrApiBase = 'https://api.qrserver.com/v1/create-qr-code/';
  }

  // 🎯 Generar código QR consistente - SIEMPRE el mismo para el mismo ID
  generateQRCode(trackId, difficulty = 'EASY', gameMode = 'SONG') {
    return `HITBACK_${trackId}_${gameMode}_${difficulty}`;
  }

  // 🖼️ Generar URL de imagen QR
  generateQRImageURL(qrCode, options = {}) {
    const params = new URLSearchParams({
      size: options.size || '250x250',
      data: qrCode,
      format: options.format || 'png',
      margin: options.margin || '15',
      qzone: options.qzone || '1',
      color: options.color || '0f172a',
      bgcolor: options.bgcolor || 'ffffff',
      ...options
    });

    return `${this.qrApiBase}?${params.toString()}`;
  }

  // 🔗 Generar endpoint completo
  generateEndpoint(trackId, baseUrl, difficulty = 'EASY') {
    const qrCode = this.generateQRCode(trackId, difficulty);
    return `${baseUrl}/api/qr/scan/${qrCode}`;
  }
}

// 🌐 SERVICIO DE BACKEND - Manejo de API calls
class BackendService {
  constructor() {
    this.retries = 3;
    this.timeout = 10000;
  }

  // 📡 Obtener tracks del backend
  async fetchTracks() {
    const url = `${AppState.currentBackendUrl}/api/test/tracks`;

    console.log(`📡 Conectando a: ${url}`);

    const response = await this.fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      cache: 'no-cache'
    });

    const data = await response.json();
    return this.extractTracks(data);
  }

  // 🔄 Fetch con reintentos
  async fetchWithRetry(url, options) {
    let lastError;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        console.log(`🔄 Intento ${attempt}/${this.retries}`);

        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(this.timeout)
        });

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

  // ⏱️ Delay helper
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 📊 Extraer tracks de diferentes formatos de respuesta
  extractTracks(data) {
    if (Array.isArray(data)) return data;
    if (data.success && Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.tracks)) return data.tracks;
    if (data.data && Array.isArray(data.data.tracks)) return data.data.tracks;

    throw new Error('Formato de respuesta inválido del backend');
  }
}

// 📊 MANAGER DE TRACKS - Data management
class TrackManager {
  static validateTrack(track) {
    return track &&
      typeof track === 'object' &&
      track.id &&
      track.title;
  }

  static normalizeTrack(track) {
    return {
      id: track.id,
      title: track.title || 'Sin título',
      artist: track.artist || 'Artista desconocido',
      album: track.album || 'Álbum desconocido',
      genre: track.genre || 'Género desconocido',
      year: track.year || 'Año desconocido',
      audioFile: track.audioFile || null
    };
  }
}

// 🎨 MANAGER DE UI - User Interface management
class UIManager {
  // 📊 Actualizar barra de estado
  updateStatus() {
    const statusBar = document.getElementById('statusBar');
    if (statusBar) {
      statusBar.innerHTML = `
        ${AppState.statusIcon} Ambiente: ${AppState.environmentName} | 
        🎯 Modo: ${AppState.currentMode.toUpperCase()} |
        📱 ${AppState.tracks.length} tracks cargados |
        🔄 Última sync: ${AppState.lastSync || 'Nunca'} |
        ⚡ Estado: ${AppState.isLoading ? 'Cargando...' : 'Listo'}
      `;
    }
  }

  // 📈 Actualizar estadísticas
  updateStats() {
    document.getElementById('totalTracks').textContent = AppState.tracks.length;
    document.getElementById('newTracks').textContent = AppState.newTracksFound;
    document.getElementById('qrGenerated').textContent = AppState.tracks.length;
    document.getElementById('lastSync').textContent = AppState.lastSync || 'Nunca';
  }

  // ⏳ Mostrar estado de carga
  showLoading(message) {
    const qrGrid = document.getElementById('qrGrid');
    qrGrid.innerHTML = `
      <div class="loading-state">
        <h3>${message}</h3>
        <div class="loading-spinner"></div>
      </div>
    `;
  }

  // 🎉 Mostrar modal con nuevas canciones
  showNewTracksModal(newTracks) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>🎉 ¡${newTracks.length} Nuevas Canciones Encontradas!</h2>
        <div class="new-tracks-list">
          ${newTracks.map(track => `
            <div class="new-track-item">
              <strong>${track.title}</strong> - ${track.artist}
              <span class="track-id">ID: ${track.id}</span>
            </div>
          `).join('')}
        </div>
        <div class="modal-actions">
          <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-primary">
            ✅ ¡Genial, crear QRs!
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Auto-cerrar después de 5 segundos
    setTimeout(() => modal.remove(), 5000);
  }
}

// 🌍 FUNCIONES GLOBALES - Interface con HTML

// 🔄 Cambiar modo de operación
function setMode(mode) {
  AppState.currentMode = mode;

  // Actualizar botones activos
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`${mode}Btn`).classList.add('active');

  console.log(`🔄 Modo cambiado a: ${mode}`);
  app.loadTracks().then(() => app.generateAllQRs());
}

// 🌍 Cambiar ambiente
function changeEnvironment() {
  const select = document.getElementById('environmentSelect');
  AppState.currentEnvironment = select.value;

  console.log(`🌍 Ambiente cambiado a: ${AppState.environmentName}`);
  app.uiManager.updateStatus();
}

// 🔄 Funciones de sincronización
function syncFromBackend() {
  app.syncFromBackend();
}

function generateAllQRs() {
  app.generateAllQRs();
}

// 📦 Descargar todos los QRs
function downloadAllQRs() {
  // Implementar descarga masiva de QRs
  alert('🚧 Función de descarga masiva en desarrollo');
}

// 📋 Copiar al portapapeles
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`✅ Copiado: ${text}`);
  }).catch(() => {
    // Fallback para navegadores sin clipboard API
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert(`✅ Copiado: ${text}`);
  });
}

// 🧪 Probar endpoint
async function testEndpoint(endpoint) {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    alert(`✅ Endpoint OK!\n${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    alert(`❌ Error en endpoint:\n${error.message}`);
  }
}

// 🚀 INICIALIZACIÓN PRINCIPAL
let app;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎵 HITBACK QR Generator - Versión Escalable');
  console.log('🏗️ Inicializando aplicación...');

  // Crear instancia principal
  app = new ScalableQRGenerator();

  // Inicializar aplicación
  await app.initialize();

  console.log('🎉 ¡Aplicación lista!');
});
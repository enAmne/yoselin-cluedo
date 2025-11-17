// Constantes de claves de almacenamiento
const CLAVE_PARTIDA = 'partida-guardada';
const CLAVE_CONFIG = 'configuracion-juego';

// Referencias a pantallas
const pantallaInicio = document.getElementById('pantalla-inicio');
const pantallaConfig = document.getElementById('pantalla-configuracion');
const pantallaJuego = document.getElementById('pantalla-juego');

// Elementos de UI
const botonNuevoJuego = document.getElementById('btn-nuevo-juego');
const botonContinuar = document.getElementById('btn-continuar');
const botonConfigurar = document.getElementById('btn-configurar');
const botonSalir = document.getElementById('btn-salir');
const mensajeInicio = document.getElementById('mensaje');

// Configuración
const inputJugadores = document.getElementById('cfg-jugadores');
const selectIdioma = document.getElementById('cfg-idioma');
const botonGuardarConfig = document.getElementById('btn-guardar-config');
const botonVolverInicio = document.getElementById('btn-volver-inicio');
const mensajeConfig = document.getElementById('mensaje-config');

// Juego
const botonGuardarPartida = document.getElementById('btn-guardar-partida');
const botonTerminarPartida = document.getElementById('btn-terminar-partida');
const botonIrInicioDesdeJuego = document.getElementById('btn-ir-inicio-desde-juego');
const mensajeJuego = document.getElementById('mensaje-juego');

// Estado en memoria
let estadoPartida = null;
let configuracion = cargarConfiguracion();

// Inicialización
actualizarEstadoContinuar();
if (configuracion) {
  inputJugadores.value = configuracion.jugadores;
  selectIdioma.value = configuracion.idioma;
}

// Eventos pantalla de inicio
botonNuevoJuego.addEventListener('click', iniciarNuevoJuego);
botonContinuar.addEventListener('click', continuarJuego);
botonConfigurar.addEventListener('click', () => mostrarPantalla('configuracion'));
botonSalir.addEventListener('click', salirAplicacion);

// Eventos configuración
botonGuardarConfig.addEventListener('click', guardarConfiguracion);
botonVolverInicio.addEventListener('click', () => mostrarPantalla('inicio'));

// Eventos juego
botonGuardarPartida.addEventListener('click', guardarPartida);
botonTerminarPartida.addEventListener('click', terminarPartida);
botonIrInicioDesdeJuego.addEventListener('click', () => mostrarPantalla('inicio'));

// Navegación de pantallas
function mostrarPantalla(nombre) {
  pantallaInicio.classList.remove('visible');
  pantallaConfig.classList.remove('visible');
  pantallaJuego.classList.remove('visible');
  switch (nombre) {
    case 'inicio': pantallaInicio.classList.add('visible'); break;
    case 'configuracion': pantallaConfig.classList.add('visible'); break;
    case 'juego': pantallaJuego.classList.add('visible'); break;
  }
}

// Lógica de juego básica

function iniciarNuevoJuego() {
  // Crear estado de partida inicial
  estadoPartida = {
    creadaEn: new Date().toISOString(),
    estado: 'iniciada',
    progreso: {},
    jugadores: configuracion?.jugadores || 4,
    idioma: configuracion?.idioma || 'es'
  };
  guardarPartidaEnLocal(estadoPartida);
  mostrarMensajeInicio('Nueva partida creada.');
  actualizarEstadoContinuar();
  mostrarPantalla('juego');
}

function continuarJuego() {
  const guardada = cargarPartidaDeLocal();
  if (!guardada) {
    mostrarMensajeInicio('No hay partida guardada para continuar.');
    return;
  }
  estadoPartida = guardada;
  mostrarMensajeJuego('Partida cargada. Estado: ' + (estadoPartida.estado || 'desconocido'));
  mostrarPantalla('juego');
}

function guardarPartida() {
  if (!estadoPartida) {
    mostrarMensajeJuego('No hay partida en curso para guardar.');
    return;
  }
  estadoPartida.actualizadaEn = new Date().toISOString();
  guardarPartidaEnLocal(estadoPartida);
  mostrarMensajeJuego('Partida guardada correctamente.');
  actualizarEstadoContinuar();
}

function terminarPartida() {
  estadoPartida = null;
  borrarPartidaDeLocal();
  mostrarMensajeJuego('Partida terminada. Volviendo al inicio.');
  actualizarEstadoContinuar();
  setTimeout(() => mostrarPantalla('inicio'), 500);
}

// Configuración

function guardarConfiguracion() {
  const jugadores = Number(inputJugadores.value || 4);
  const idioma = String(selectIdioma.value || 'es');
  configuracion = { jugadores, idioma, actualizadaEn: new Date().toISOString() };
  localStorage.setItem(CLAVE_CONFIG, JSON.stringify(configuracion));
  mostrarMensajeConfig('Configuración guardada.');
}

function cargarConfiguracion() {
  try {
    const cfg = localStorage.getItem(CLAVE_CONFIG);
    return cfg ? JSON.parse(cfg) : null;
  } catch { return null; }
}

// Persistencia utilidades

function guardarPartidaEnLocal(partida) {
  try {
    localStorage.setItem(CLAVE_PARTIDA, JSON.stringify(partida));
  } catch {}
}

function cargarPartidaDeLocal() {
  try {
    const guardada = localStorage.getItem(CLAVE_PARTIDA);
    return guardada ? JSON.parse(guardada) : null;
  } catch { return null; }
}

function borrarPartidaDeLocal() {
  try { localStorage.removeItem(CLAVE_PARTIDA); } catch {}
}

// Botón salir

async function salirAplicacion() {
  try {
    const esNativo = window.Capacitor && window.Capacitor.isNativePlatform;
    if (esNativo && window.CapacitorApp && typeof window.CapacitorApp.exitApp === 'function') {
      await window.CapacitorApp.exitApp();
      return;
    }
  } catch {}
  mostrarMensajeInicio('Para salir, cierra la ventana o usa el botón atrás del dispositivo.');
}

// Mensajes

function mostrarMensajeInicio(texto) { mensajeInicio.textContent = texto; }
function mostrarMensajeConfig(texto) { mensajeConfig.textContent = texto; }
function mostrarMensajeJuego(texto) { mensajeJuego.textContent = texto; }

function actualizarEstadoContinuar() {
  const hayPartida = !!localStorage.getItem(CLAVE_PARTIDA);
  botonContinuar.disabled = !hayPartida;
}
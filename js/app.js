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
const formularioNuevaPartida = document.getElementById('form-nueva-partida');
const tituloPantallaJuego = document.getElementById('titulo-pantalla-juego');
const botonEmpezarPartida = document.getElementById('btn-empezar-partida');
const botonVolverDesdeJuego = document.getElementById('btn-volver-desde-juego');
const checkCasita = document.getElementById('chk-casita');
const checkSegundoPiso = document.getElementById('chk-segundo-piso');
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
botonNuevoJuego.addEventListener('click', prepararNuevaPartida);
botonContinuar.addEventListener('click', continuarJuego);
botonConfigurar.addEventListener('click', () => mostrarPantalla('configuracion'));
botonSalir.addEventListener('click', salirAplicacion);

// Eventos configuración
botonGuardarConfig.addEventListener('click', guardarConfiguracion);
botonVolverInicio.addEventListener('click', () => mostrarPantalla('inicio'));

// Eventos juego
formularioNuevaPartida?.addEventListener('submit', (evento) => evento.preventDefault());
botonEmpezarPartida.addEventListener('click', empezarPartidaConOpciones);
botonVolverDesdeJuego.addEventListener('click', () => mostrarPantalla('inicio'));

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

function prepararNuevaPartida() {
  resetFormularioNuevaPartida();
  tituloPantallaJuego.textContent = 'Nueva partida';
  mostrarMensajeJuego('Selecciona el nivel del juego y las opciones que prefieras.');
  mostrarPantalla('juego');
}

function empezarPartidaConOpciones() {
  const nivelSeleccionado = document.querySelector('input[name="nivel-juego"]:checked');
  if (!nivelSeleccionado) {
    mostrarMensajeJuego('Debes elegir un nivel de juego antes de continuar.');
    return;
  }
  const nivel = nivelSeleccionado.value;
  const opciones = {
    conCasita: checkCasita.checked,
    conSegundoPiso: checkSegundoPiso.checked
  };

  estadoPartida = {
    creadaEn: new Date().toISOString(),
    estado: 'iniciada',
    progreso: {},
    jugadores: configuracion?.jugadores || 4,
    idioma: configuracion?.idioma || 'es',
    nivel,
    opciones
  };
  guardarPartidaEnLocal(estadoPartida);
  tituloPantallaJuego.textContent = 'Partida en curso';
  const extras = [];
  if (opciones.conCasita) extras.push('casita');
  if (opciones.conSegundoPiso) extras.push('2º piso');
  const textoExtras = extras.length ? ` con ${extras.join(' y ')}` : '';
  mostrarMensajeJuego(`Partida creada: ${formatearNombreNivel(nivel)}${textoExtras}.`);
  actualizarEstadoContinuar();
}

function continuarJuego() {
  const guardada = cargarPartidaDeLocal();
  if (!guardada) {
    mostrarMensajeInicio('No hay partida guardada para continuar.');
    return;
  }
  estadoPartida = guardada;
  tituloPantallaJuego.textContent = 'Partida en curso';
  const nivelMostrado = formatearNombreNivel(estadoPartida.nivel);
  const extras = [];
  if (estadoPartida?.opciones?.conCasita) extras.push('casita');
  if (estadoPartida?.opciones?.conSegundoPiso) extras.push('2º piso');
  const textoExtras = extras.length ? ` con ${extras.join(' y ')}` : '';
  mostrarMensajeJuego(`Partida cargada. Nivel: ${nivelMostrado}${textoExtras}.`);
  mostrarPantalla('juego');
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

function resetFormularioNuevaPartida() {
  formularioNuevaPartida?.reset();
  const radioFacil = document.querySelector('input[name="nivel-juego"][value="facil-2x2"]');
  if (radioFacil) radioFacil.checked = true;
  if (checkCasita) checkCasita.checked = false;
  if (checkSegundoPiso) checkSegundoPiso.checked = false;
}

function formatearNombreNivel(nivel) {
  switch (nivel) {
    case 'facil-2x2': return 'Fácil 2x2';
    case 'normal-2x3': return 'Normal 2x3';
    case 'dificil-3x3': return 'Difícil 3x3';
    default: return 'nivel desconocido';
  }
}
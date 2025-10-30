let amigos = [];
let ganadores = [];
let anguloInicial = 0;

const input = document.getElementById("amigo");
const btnAgregar = document.getElementById("btnAgregar");
const btnSortear = document.getElementById("btnSortear");
const btnReiniciar = document.getElementById("btnReiniciar");
const lista = document.getElementById("listaAmigos");
const resultado = document.getElementById("resultado");
const ganadorTexto = document.getElementById("ganador");
const canvas = document.getElementById("ruleta");
const ctx = canvas.getContext("2d");

// 🎵 Sonidos
const sonidoRuleta = new Audio("sounds/ruleta_spin.wav");
const sonidoChips = new Audio("sounds/chip_sound.mp3");
const sonidoGanador = new Audio("sounds/008621572_prev.mp3");
const sonidoReinicio = new Audio("sounds/ringtones-joker-risa.mp3");
sonidoReinicio.volume = 0.3;

const logoImg = new Image();
logoImg.src = "assets/logo.png";

// Esperar a que cargue el logo antes del primer dibujo
logoImg.addEventListener("load", () => {
  dibujarRuleta();
});


/* ------------------------
   LISTENERS INICIALES
   ------------------------ */

// Enter agrega participante
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") agregarAmigo();
});

// Cuando el usuario hace clic en el input, activa visualmente el botón verde
input.addEventListener("focus", () => {
  btnAgregar.classList.add("encendido");
});
// Si pierde foco, quitar solo la apariencia (no la funcionalidad)
input.addEventListener("blur", () => {
  btnAgregar.classList.remove("encendido");
});
// También activamos la apariencia del botón verde según contenido
/*input.addEventListener("input", () => {
  if (input.value.trim() !== "") {
    btnAgregar.classList.add("encendido");
  } else {
    btnAgregar.classList.remove("encendido");
  }
});*/

// Clicks
btnAgregar.addEventListener("click", agregarAmigo);
btnSortear.addEventListener("click", sortearAmigo);

/* ------------------------
   BOTÓN REINICIAR
   ------------------------ */
btnReiniciar.addEventListener("click", () => {
  sonidoReinicio.currentTime = 0;
  sonidoReinicio.play();

  amigos = [];
  ganadores = [];
  ganadorTexto.textContent = "";
  resultado.innerHTML = "";
  mostrarAmigos();
  dibujarRuleta();

  // Estado de botones tras reinicio
  btnSortear.classList.remove("encendido");
  btnSortear.disabled = true;   // necesita >=2 para activarse
  btnAgregar.classList.add("encendido");

  input.value = "";
  input.focus();
});

/* ------------------------
   AGREGAR PARTICIPANTE
   ------------------------ */
function agregarAmigo() {
  const nombre = input.value.trim();
  if (!nombre) {
    alert("Ingrese un nombre");
    input.focus();
    return;
  }
  if (amigos.includes(nombre)) {
    alert("Ya está en la lista");
    input.focus();
    return;
  }

  sonidoChips.currentTime = 0;
  sonidoChips.play();

  amigos.push(nombre);
  mostrarAmigos();
  dibujarRuleta();

  // Visual: activar rojo si ya hay 2 o más
  if (amigos.length >= 2) {
    btnSortear.classList.add("encendido");
    btnSortear.disabled = false;
  }

  // Mantener el botón verde encendido breve
  btnAgregar.classList.add("encendido");
  setTimeout(() => btnAgregar.classList.remove("encendido"), 300);

  input.value = "";
  input.focus();
}

/* ------------------------
   MOSTRAR LISTAS
   ------------------------ */
function mostrarAmigos() {
  // si querés orden visual distinto podés ajustarlo aquí
  lista.innerHTML = amigos.map(a => `<li>${a}</li>`).join("");
}
function mostrarResultados() {
  resultado.innerHTML = ganadores.map((g,i) => `<li>${i+1}. ${g}</li>`).join("");
}

/* ------------------------
   DIBUJO DE LA RULETA
   ------------------------ */
function dibujarRuleta() {
  const total = amigos.length;
  const radio = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // === DIBUJO DE LA RULETA ===
  if (total > 0) {
    const anguloPor = (2 * Math.PI) / total;
    for (let i = 0; i < total; i++) {
      const inicio = anguloInicial + i * anguloPor;
      ctx.beginPath();
      ctx.moveTo(radio, radio);
      ctx.arc(radio, radio, radio - 10, inicio, inicio + anguloPor);
      ctx.fillStyle = `hsl(${(i * 360) / total}, 80%, 55%)`;
      ctx.fill();

      // Texto en cada sector
      ctx.save();
      ctx.translate(radio, radio);
      ctx.rotate(inicio + anguloPor / 2 + Math.PI / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.textBaseline = "middle";
      ctx.font = "bold 20px Inter";
      ctx.fillText(amigos[i], 0, -(radio - 40));
      ctx.restore();
    }
  }

  // === CÍRCULO NEGRO CENTRAL (más grande que el logo) ===
  const logoSize = Math.min(canvas.width, canvas.height) * 0.35;
  const radioCirculo = (logoSize / 2) * 1.1; // 20% más grande que el logo

  ctx.beginPath();
  ctx.arc(radio, radio, radioCirculo, 0, 2 * Math.PI);
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();
  ctx.closePath();

  // === LOGO CON EFECTO NEÓN PARPADEANTE ===
  if (logoImg.complete) {
    const x = canvas.width / 2 - logoSize / 2;
    const y = canvas.height / 2 - logoSize / 2;
    const brillo = 0.6 + 0.4 * Math.sin(Date.now() / 800); // pulso suave

    ctx.save();
    ctx.globalAlpha = brillo;
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 25 * brillo;
    ctx.drawImage(logoImg, x, y, logoSize, logoSize);
    ctx.restore();
  }

  // 🔁 Mantener el efecto parpadeante del logo
  requestAnimationFrame(dibujarRuleta);
}

/* ------------------------
   SORTEO (optimizado para equipos lentos)
   ------------------------ */
function sortearAmigo() {
  if (amigos.length < 2) {
    alert("Se necesitan al menos 2 participantes");
    input.focus();
    return;
  }

  mezclarAmigos();

  // 🔒 Bloquear entrada mientras gira
  btnSortear.classList.remove("encendido");
  btnSortear.disabled = true;
  btnAgregar.classList.remove("encendido");
  btnAgregar.disabled = true;
  input.disabled = true;

  sonidoRuleta.currentTime = 0;
  sonidoRuleta.play();

  // --- Variables del giro ---
  const duracion = 3500; // duración total (ms)
  const giroTotal = (Math.random() * 6 + 10) * Math.PI; // rango de 10 a 16 “medios giros”
  const inicio = performance.now();

  function animar(t) {
    const tiempo = t - inicio;
    const progreso = Math.min(tiempo / duracion, 1);

    // Easing suave: acelera rápido y frena natural
    const easing = 1 - Math.pow(1 - progreso, 3);

    // Actualizar ángulo basado en tiempo y easing (independiente de FPS)
    anguloInicial = giroTotal * easing;
    dibujarRuleta();

    if (progreso < 1) {
      requestAnimationFrame(animar);
    } else {
      // Fin del giro
      sonidoRuleta.pause();
      sonidoRuleta.currentTime = 0;
      finalizarSorteo();
    }
  }

  requestAnimationFrame(animar);

  function finalizarSorteo() {
    const ganador = calcularGanador(anguloInicial);

    // Mostrar ganador con efecto visual
    input.value = `🥳 ${ganador}!`;
    input.style.animation = "ganadorFlash 1s ease-in-out 3";
    input.style.color = "#e5f73dff";
    input.style.textShadow = "0 0 10px #e5f73dff";

    sonidoGanador.currentTime = 0;
    sonidoGanador.play();

    // Guardar y eliminar ganador
    ganadores.push(ganador);
    mostrarResultados();
    amigos = amigos.filter(a => a !== ganador);
    mostrarAmigos();
    dibujarRuleta();

    // Reinicio visual
    setTimeout(() => {
      input.value = "";
      input.style.animation = "";
      input.style.color = "#fff";
      input.style.textShadow = "0 0 6px white";

      btnAgregar.disabled = false;
      input.disabled = false;

      if (amigos.length <= 1) {
        btnSortear.classList.remove("encendido");
        btnSortear.disabled = true;
        setTimeout(() => btnReiniciar.focus(), 300);
      } else {
        setTimeout(() => {
          dibujarRuleta();
          btnSortear.classList.add("encendido");
          btnSortear.disabled = false;
          btnSortear.focus();
        }, 300);
      }

      input.focus();
      btnAgregar.classList.remove("encendido");
    }, 3000);
  }
}


/* ------------------------
   CÁLCULO GANADOR
   ------------------------ */
function calcularGanador(anguloFinal) {
  const total = amigos.length;
  const angPor = (2 * Math.PI) / total;
  const norm = anguloFinal % (2 * Math.PI);
  const flecha = (3 * Math.PI) / 2;
  const relativo = (flecha - norm + 2 * Math.PI) % (2 * Math.PI);
  const idx = Math.floor(relativo / angPor);
  return amigos[idx];
}

/* ------------------------
   INICIALIZACIÓN
   ------------------------ */
dibujarRuleta();
btnAgregar.classList.add("encendido");
// asegurar estado inicial del botón rojo
if (amigos.length < 2) btnSortear.disabled = true;

/* ------------------------
   UTIL: MEZCLAR (Fisher-Yates)
   ------------------------ */
function mezclarAmigos() {
  for (let i = amigos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [amigos[i], amigos[j]] = [amigos[j], amigos[i]];
  }
}

/* ------------------------
   ESTILO DINÁMICO (animación ganador)
   ------------------------ */
const style = document.createElement("style");
style.textContent = `
@keyframes ganadorFlash {
  0%, 100% { box-shadow: 0 0 10px #ffffffff; }
  50% { box-shadow: 0 0 30px #ffffffff; }
}`;
document.head.appendChild(style);

/* ------------------------
   BUCLE GENERAL DE ANIMACIÓN
   ------------------------ */
function animarRuleta() {
  dibujarRuleta();
  requestAnimationFrame(animarRuleta);
}
animarRuleta(); // inicia el bucle continuo


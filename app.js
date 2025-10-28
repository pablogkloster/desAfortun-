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
const sonidoRuleta = new Audio("assets/ruleta_spin.wav");
const sonidoChips = new Audio("assets/chip_sound.mp3");
const sonidoGanador = new Audio("assets/win_sound.mp3");
const sonidoReinicio = new Audio("assets/pacman-dies.mp3");
sonidoReinicio.volume = 0.3;

// Enter agrega participante
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") agregarAmigo();
});

// Evento click en botón verde
btnAgregar.addEventListener("click", agregarAmigo);

btnSortear.addEventListener("click", sortearAmigo);

// Botón reiniciar
btnReiniciar.addEventListener("click", () => {
  sonidoReinicio.currentTime = 0; // 🔹 Reinicia el sonido
  sonidoReinicio.play();          // 🔊 Reproduce el sonido de reinicio

  amigos = [];
  ganadores = [];
  ganadorTexto.textContent = "";
  mostrarAmigos();
  dibujarRuleta();
  resultado.innerHTML = ""; // 🔹 Limpia la lista visual de ganadores
  btnSortear.classList.remove("encendido");
});

// Agregar amigo
function agregarAmigo() {
  const nombre = input.value.trim();
  if (!nombre) {
    alert("Ingrese un nombre");
    return;
  }
  if (amigos.includes(nombre)) {
    alert("Ya está en la lista");
    return;
  }

  sonidoChips.currentTime = 0;
  sonidoChips.play();

  amigos.push(nombre);
  mostrarAmigos();
  dibujarRuleta();

  btnSortear.classList.remove("encendido");
  btnAgregar.classList.remove("encendido");
  setTimeout(() => {
    if (amigos.length >= 2) btnSortear.classList.add("encendido");
    btnAgregar.classList.add("encendido");
  }, 300);

  input.value = "";
  input.focus();
}

function mostrarAmigos() {
  lista.innerHTML = amigos.map(a => `<li>${a}</li>`).join("");
}
function mostrarResultados() {
  resultado.innerHTML = ganadores.map((g,i) => `<li>${i+1}. ${g}</li>`).join("");
}

// Dibujo base de ruleta
function dibujarRuleta() {
  const total = amigos.length;
  const radio = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (total === 0) {
    ctx.beginPath();
    ctx.arc(radio, radio, radio - 10, 0, 2 * Math.PI);
    ctx.fillStyle = "#222";
    ctx.fill();
    return;
  }

  const anguloPor = (2 * Math.PI) / total;
  for (let i = 0; i < total; i++) {
    const inicio = anguloInicial + i * anguloPor;
    ctx.beginPath();
    ctx.moveTo(radio, radio);
    ctx.arc(radio, radio, radio - 10, inicio, inicio + anguloPor);
    ctx.fillStyle = `hsl(${(i * 360) / total}, 80%, 55%)`;
    ctx.fill();
    ctx.save();
    ctx.translate(radio, radio);
    ctx.rotate(inicio + anguloPor / 2 + Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.textBaseline = "middle"
    ctx.font = "bold 20px Inter";
    ctx.fillText(amigos[i], 0, -(radio - 40))
    ctx.restore();
  }

  // Centro
  ctx.beginPath();
  ctx.arc(radio, radio, 40, 0, 2 * Math.PI);
  ctx.fillStyle = "#222";
  ctx.fill();

  
}

function sortearAmigo() {
  if (amigos.length < 2) {
    alert("Se necesitan al menos 2 participantes");
    return;
  }

  mezclarAmigos();

  btnSortear.classList.remove("encendido");
  btnSortear.disabled = true;
  btnAgregar.classList.remove("encendido");

  sonidoRuleta.currentTime = 0;
  sonidoRuleta.play();

  const giro = Math.random() * 2000 + 3000;
  const duracion = 4000;
  const inicio = performance.now();

  function animar(t) {
    const progreso = Math.min((t - inicio) / duracion, 1);
    const easing = 1 - Math.pow(1 - progreso, 3);
    anguloInicial = (easing * giro * Math.PI) / 180;
    dibujarRuleta();

    if (progreso < 1) {
      requestAnimationFrame(animar);
    } else {
      sonidoRuleta.pause();
      sonidoRuleta.currentTime = 0;
      const ganador = calcularGanador(anguloInicial);
      ganadorTexto.textContent = `🥳 ${ganador}!`;
      sonidoGanador.currentTime = 0;
      sonidoGanador.play();
      ganadores.push(ganador);
      mostrarResultados();
      amigos = amigos.filter(a => a !== ganador);
      mostrarAmigos();
      setTimeout(() => {
        dibujarRuleta();
        if (amigos.length >= 2) btnSortear.classList.add("encendido");
        btnSortear.disabled = false;
        btnAgregar.classList.add("encendido");
      }, 1000);
    }
  }
  requestAnimationFrame(animar);
}

function calcularGanador(anguloFinal) {
  const total = amigos.length;
  const angPor = (2 * Math.PI) / total;
  const norm = anguloFinal % (2 * Math.PI);
  const flecha = (3 * Math.PI) / 2;
  const relativo = (flecha - norm + 2 * Math.PI) % (2 * Math.PI);
  const idx = Math.floor(relativo / angPor);
  return amigos[idx];
}

// Inicial
dibujarRuleta();
btnAgregar.classList.add("encendido");

// Mezcla aleatoriamente el orden del array (algoritmo de Fisher-Yates)
function mezclarAmigos() {
  for (let i = amigos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [amigos[i], amigos[j]] = [amigos[j], amigos[i]];
  }
}

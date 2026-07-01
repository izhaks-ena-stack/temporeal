// cronometro.js - Izhak

const status = document.getElementById("status");
const cronometroMode = document.getElementById("cronometroMode");
const pomodoroMode = document.getElementById("pomodoroMode");
const timer = document.getElementById("cronometro");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const listaHistorico = document.getElementById("listaHistorico");

let tempo = 0;
let intervalo = null;
let modo = "cronometro";
let faseAtual = "foco";

if (cronometroMode) {
    cronometroMode.addEventListener("click", function () {
        clearInterval(intervalo);
        intervalo = null;
        modo = "cronometro";
        tempo = 0;
        timer.innerText = "00:00:00";
        status.innerText = "Modo: Cronômetro";
    });
}

if (pomodoroMode) {
    pomodoroMode.addEventListener("click", function () {
        clearInterval(intervalo);
        intervalo = null;
        modo = "pomodoro";
        tempo = 1500;
        faseAtual = "foco";
        timer.innerText = "25:00";
        status.innerText = "Modo: Pomodoro";
    });
}

function atualizarTimer() {
    if (modo === "cronometro") {
        tempo++;
        let horas = String(Math.floor(tempo / 3600)).padStart(2, "0");
        let minutos = String(Math.floor((tempo % 3600) / 60)).padStart(2, "0");
        let segundos = String(tempo % 60).padStart(2, "0");
        timer.innerText = `${horas}:${minutos}:${segundos}`;
    } else if (modo === "pomodoro") {
        tempo--;
        let minutos = String(Math.floor(tempo / 60)).padStart(2, "0");
        let segundos = String(tempo % 60).padStart(2, "0");
        timer.innerText = `${minutos}:${segundos}`;

        if (tempo <= 0) {
            if (faseAtual === "foco") {
                faseAtual = "descanso";
                tempo = 300;
                status.innerText = "Hora do descanso!";
            } else {
                faseAtual = "foco";
                tempo = 1500;
                status.innerText = "Modo foco";
            }
        }
    }
}

if (startBtn) {
    startBtn.addEventListener("click", function () {
        if (intervalo !== null) return;
        intervalo = setInterval(atualizarTimer, 1000);
    });
}

if (pauseBtn) {
    pauseBtn.addEventListener("click", function () {
        clearInterval(intervalo);
        intervalo = null;
    });
}

if (resetBtn) {
    resetBtn.addEventListener("click", function () {
        salvarSessao();
        clearInterval(intervalo);
        intervalo = null;

        if (modo === "cronometro") {
            tempo = 0;
            timer.innerText = "00:00:00";
        } else {
            tempo = 1500;
            timer.innerText = "25:00";
        }
    });
}

async function salvarSessao() {
    const sessao = {
        modo: modo,
        tempo: timer.innerText,
        data: new Date().toLocaleString()
    };

    await fetch("http://localhost:3000/sessoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessao)
    });

    carregarHistorico();
}

async function carregarHistorico() {
    if (!listaHistorico) return;
    const resposta = await fetch("http://localhost:3000/sessoes");
    const sessoes = await resposta.json();
    listaHistorico.innerHTML = "";

    sessoes.forEach(function (sessao) {
        const item = document.createElement("li");
        item.innerText = `${sessao.modo} - ${sessao.tempo} - ${sessao.data}`;

        const botaoExcluir = document.createElement("button");
        botaoExcluir.innerText = "Excluir";
        botaoExcluir.className = "btn btn-sm btn-outline-danger ms-3";
        botaoExcluir.addEventListener("click", function () {
            deletarSessao(sessao.id);
        });

        item.appendChild(botaoExcluir);
        listaHistorico.appendChild(item);
    });
}

async function deletarSessao(id) {
    await fetch(`http://localhost:3000/sessoes/${id}`, { method: "DELETE" });
    carregarHistorico();
}

carregarHistorico();

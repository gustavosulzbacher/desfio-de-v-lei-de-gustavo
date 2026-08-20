/* ==========================================
   DESAFIO DO VÔLEI
   Sistema principal do jogo
========================================== */

const PONTOS_VITORIA = 5;

const jogo = {
    set: 1,
    sets: { A: 0, B: 0 },
    placar: { A: 0, B: 0 },
    sacando: "A",
    bola: {
        emJogo: false,
        defendida: false,
        levantada: false
    },
    partidaEncerrada: false,
    historico: []
};

const elementos = {
    placarA: document.getElementById("placarA"),
    placarB: document.getElementById("placarB"),
    setAtual: document.getElementById("setAtual"),
    statusJogo: document.getElementById("statusJogo"),
    sacandoTexto: document.getElementById("sacandoTexto"),
    resultado: document.getElementById("resultado"),
    historico: document.getElementById("historico"),
    bola: document.getElementById("bola"),
    btnSaque: document.getElementById("btnSaque"),
    btnDefesa: document.getElementById("btnDefesa"),
    btnLevantamento: document.getElementById("btnLevantamento"),
    btnAtaque: document.getElementById("btnAtaque"),
    btnBloqueio: document.getElementById("btnBloqueio"),
    btnRodizio: document.getElementById("btnRodizio"),
    btnReiniciar: document.getElementById("btnReiniciar"),
    btnLimparHistorico: document.getElementById("btnLimparHistorico")
};

const ROTACAO = {
    1: 6,
    6: 5,
    5: 4,
    4: 3,
    3: 2,
    2: 1
};

document.addEventListener("DOMContentLoaded", () => {
    configurarEventos();
    atualizarInterface();
    adicionarHistorico("🏐 Partida iniciada. Time A começa sacando.");
});

function configurarEventos() {
    elementos.btnSaque.addEventListener("click", sacar);
    elementos.btnDefesa.addEventListener("click", defender);
    elementos.btnLevantamento.addEventListener("click", levantar);
    elementos.btnAtaque.addEventListener("click", atacar);
    elementos.btnBloqueio.addEventListener("click", bloquear);
    elementos.btnRodizio.addEventListener("click", fazerRodizio);
    elementos.btnReiniciar.addEventListener("click", reiniciarPartida);
    elementos.btnLimparHistorico.addEventListener("click", limparHistorico);
}

function obterNomeJogador(posicao, padrao = `Jogador ${posicao}`) {
    const input = document.getElementById(`pos${posicao}`);
    if (!input) {
        return padrao;
    }

    return input.value.trim() || padrao;
}

function sacar() {
    if (!podeJogar()) return;
    if (jogo.bola.emJogo) {
        mostrarResultado("⚠️ A bola já está em jogo!");
        return;
    }
    if (jogo.sacando !== "A") {
        mostrarResultado("⚠️ Neste momento o Time B está com o saque.");
        return;
    }

    const sacador = obterNomeJogador(1);

    jogo.bola.emJogo = true;
    jogo.bola.defendida = false;
    jogo.bola.levantada = false;

    moverBola("b");
    elementos.bola.classList.add("saque");

    setTimeout(() => {
        elementos.bola.classList.remove("saque");
    }, 700);

    mostrarResultado(`🏐 Saque realizado por <strong>${escaparHTML(sacador)}</strong>!`);
    adicionarHistorico(`🏐 ${sacador} realizou o saque.`);
    atualizarInterface();
}

function defender() {
    if (!podeJogar()) return;
    if (!jogo.bola.emJogo) {
        mostrarResultado("⚠️ Faça o saque antes da defesa.");
        return;
    }
    if (jogo.bola.defendida) {
        mostrarResultado("⚠️ A defesa já foi realizada.");
        return;
    }

    const defensor = obterNomeJogador(5);

    jogo.bola.defendida = true;
    moverBola("a");

    mostrarResultado(`👏 <strong>${escaparHTML(defensor)}</strong> fez uma ótima defesa! Agora é hora do levantamento.`);
    adicionarHistorico(`👏 ${defensor} realizou a defesa.`);
    atualizarInterface();
}

function levantar() {
    if (!podeJogar()) return;
    if (!jogo.bola.emJogo) {
        mostrarResultado("⚠️ Primeiro é necessário iniciar o rally com o saque.");
        return;
    }
    if (!jogo.bola.defendida) {
        mostrarResultado("⚠️ É necessário realizar a defesa antes do levantamento.");
        return;
    }
    if (jogo.bola.levantada) {
        mostrarResultado("⚠️ O levantamento já foi realizado.");
        return;
    }

    const levantador = obterNomeJogador(3);

    jogo.bola.levantada = true;
    moverBola("a");

    mostrarResultado(`🎯 <strong>${escaparHTML(levantador)}</strong> fez um levantamento perfeito! A bola está pronta para o ataque.`);
    adicionarHistorico(`🎯 ${levantador} fez o levantamento.`);
    atualizarInterface();
}

function atacar() {
    if (!podeJogar()) return;
    if (!jogo.bola.levantada) {
        mostrarResultado("⚠️ <strong>Ataque não permitido!</strong><br>Faça o levantamento primeiro.");
        return;
    }

    const atacante = obterNomeJogador(4);

    jogo.bola.levantada = false;
    moverBola("b");

    mostrarResultado(`🔥 <strong>${escaparHTML(atacante)}</strong> atacou com força! Ponto para o Time A!`);
    adicionarHistorico(`🔥 ${atacante} realizou um ataque.`);
    marcarPonto("A");
}

function bloquear() {
    if (!podeJogar()) return;
    if (!jogo.bola.emJogo) {
        mostrarResultado("⚠️ Não há bola em jogo.");
        return;
    }
    if (!jogo.bola.levantada) {
        mostrarResultado("⚠️ O bloqueio ocorre contra um ataque. Faça a sequência primeiro.");
        return;
    }

    jogo.bola.levantada = false;
    mostrarResultado("🛡️ Bloqueio perfeito! A bola foi bloqueada!");
    adicionarHistorico("🛡️ Bloqueio realizado.");
    marcarPonto("A");
}

function marcarPonto(time) {
    if (jogo.partidaEncerrada) return;

    jogo.placar[time]++;
    atualizarPlacar();

    if (verificarFimDoSet()) {
        return;
    }

    reiniciarRally();

    if (time === "A") {
        jogo.sacando = "A";
        fazerRodizio(false);
    }
}

function fazerRodizio(mostrarMensagem = true) {
    if (jogo.partidaEncerrada) return;

    const nomes = {};
    for (let posicao = 1; posicao <= 6; posicao++) {
        nomes[posicao] = obterNomeJogador(posicao, `Jogador ${posicao}`);
    }

    for (const origem in ROTACAO) {
        const destino = ROTACAO[origem];
        document.getElementById(`pos${destino}`).value = nomes[origem];
    }

    jogo.bola.defendida = false;
    jogo.bola.levantada = false;
    destacarPosicao(1);

    if (mostrarMensagem) {
        mostrarResultado(`🔄 Rodízio realizado! <strong>${escaparHTML(nomes[2])}</strong> agora está na Posição 1 e será o sacador.`);
        adicionarHistorico(`🔄 Rodízio realizado. ${nomes[2]} passou para a posição 1.`);
    }

    atualizarInterface();
}

function verificarFimDoSet() {
    const pontosA = jogo.placar.A;
    const pontosB = jogo.placar.B;

    if (pontosA < PONTOS_VITORIA && pontosB < PONTOS_VITORIA) {
        return false;
    }

    if (Math.abs(pontosA - pontosB) < 2) {
        return false;
    }

    const vencedor = pontosA > pontosB ? "A" : "B";
    jogo.sets[vencedor]++;
    jogo.partidaEncerrada = true;
    jogo.bola.emJogo = false;

    const nomeVencedor = vencedor === "A" ? "Time A" : "Time B";
    mostrarResultado(`🏆 <strong>FIM DO SET!</strong><br>${nomeVencedor} venceu o Set ${jogo.set}!`);
    adicionarHistorico(`🏆 ${nomeVencedor} venceu o Set ${jogo.set}.`);
    atualizarInterface();

    setTimeout(() => {
        const continuar = confirm(`${nomeVencedor} venceu o Set ${jogo.set}!\n\nDeseja iniciar o próximo set?`);
        if (continuar) {
            iniciarNovoSet();
        }
    }, 300);

    return true;
}

function iniciarNovoSet() {
    jogo.set++;
    jogo.placar.A = 0;
    jogo.placar.B = 0;
    jogo.bola.emJogo = false;
    jogo.bola.defendida = false;
    jogo.bola.levantada = false;
    jogo.partidaEncerrada = false;
    jogo.sacando = "A";

    atualizarInterface();
    mostrarResultado(`🏐 Novo set iniciado! Set ${jogo.set}. Time A começa sacando.`);
    adicionarHistorico(`🏐 Set ${jogo.set} iniciado.`);
    destacarPosicao(1);
}

function reiniciarRally() {
    jogo.bola.emJogo = false;
    jogo.bola.defendida = false;
    jogo.bola.levantada = false;
    moverBola("centro");
    atualizarInterface();
}

function reiniciarPartida() {
    const confirmar = confirm("Tem certeza que deseja reiniciar toda a partida?");
    if (!confirmar) return;

    jogo.set = 1;
    jogo.sets.A = 0;
    jogo.sets.B = 0;
    jogo.placar.A = 0;
    jogo.placar.B = 0;
    jogo.sacando = "A";
    jogo.bola.emJogo = false;
    jogo.bola.defendida = false;
    jogo.bola.levantada = false;
    jogo.partidaEncerrada = false;
    jogo.historico = [];

    elementos.historico.innerHTML = "";
    mostrarResultado("🏐 Partida reiniciada! Time A começa sacando.");
    adicionarHistorico("🔄 Partida reiniciada.");
    atualizarInterface();
    destacarPosicao(1);
}

function atualizarPlacar() {
    elementos.placarA.textContent = jogo.placar.A;
    elementos.placarB.textContent = jogo.placar.B;
    elementos.setAtual.textContent = `SET ${jogo.set}`;
}

function atualizarInterface() {
    atualizarPlacar();

    if (jogo.partidaEncerrada) {
        elementos.statusJogo.textContent = "Set encerrado";
    } else if (!jogo.bola.emJogo) {
        elementos.statusJogo.textContent = "Aguardando saque";
    } else if (!jogo.bola.defendida) {
        elementos.statusJogo.textContent = "Faça a defesa";
    } else if (!jogo.bola.levantada) {
        elementos.statusJogo.textContent = "Faça o levantamento";
    } else {
        elementos.statusJogo.textContent = "Escolha: ataque ou bloqueio";
    }

    elementos.sacandoTexto.textContent = `🏐 Sacando: Time ${jogo.sacando}`;
    atualizarBotoes();
}

function atualizarBotoes() {
    const encerrado = jogo.partidaEncerrada;

    elementos.btnSaque.disabled = encerrado || jogo.bola.emJogo || jogo.sacando !== "A";
    elementos.btnDefesa.disabled = encerrado || !jogo.bola.emJogo || jogo.bola.defendida;
    elementos.btnLevantamento.disabled = encerrado || !jogo.bola.defendida || jogo.bola.levantada;
    elementos.btnAtaque.disabled = encerrado || !jogo.bola.levantada;
    elementos.btnBloqueio.disabled = encerrado || !jogo.bola.levantada;
    elementos.btnRodizio.disabled = encerrado;
}

function mostrarResultado(mensagem) {
    elementos.resultado.innerHTML = mensagem;
}

function adicionarHistorico(mensagem) {
    const agora = new Date();
    const hora = agora.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    jogo.historico.unshift({ hora, mensagem });
    renderizarHistorico();
}

function renderizarHistorico() {
    elementos.historico.innerHTML = "";

    jogo.historico.slice(0, 30).forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.hora} — ${item.mensagem}`;
        elementos.historico.appendChild(li);
    });
}

function limparHistorico() {
    jogo.historico = [];
    elementos.historico.innerHTML = "";
}

function moverBola(direcao) {
    elementos.bola.classList.remove("mover-a", "mover-b");

    if (direcao === "a") {
        elementos.bola.classList.add("mover-a");
    }

    if (direcao === "b") {
        elementos.bola.classList.add("mover-b");
    }
}

function destacarPosicao(posicao) {
    document.querySelectorAll(".jogador").forEach(jogador => {
        jogador.classList.remove("ativo");
    });

    const jogador = document.querySelector(`.jogador[data-posicao="${posicao}"]`);
    if (jogador) {
        jogador.classList.add("ativo");
    }
}

function podeJogar() {
    if (jogo.partidaEncerrada) {
        mostrarResultado("🏁 O set terminou. Inicie um novo set.");
        return false;
    }

    return true;
}

function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

document.addEventListener("keydown", event => {
    const tecla = event.key.toLowerCase();

    if (event.target.tagName === "INPUT") {
        return;
    }

    switch (tecla) {
        case "s":
            sacar();
            break;
        case "d":
            defender();
            break;
        case "l":
            levantar();
            break;
        case "a":
            atacar();
            break;
        case "b":
            bloquear();
            break;
        case "r":
            fazerRodizio();
            break;
    }
});
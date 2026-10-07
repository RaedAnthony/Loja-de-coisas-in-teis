const jogo = document.getElementById("jogo");
const inimigo = document.getElementById("inimigo");
const vidasTexto = document.getElementById("vidas");
const vitoriasTexto = document.getElementById("vitorias");
const tempoTexto = document.getElementById("tempo");
const mensagem = document.getElementById("mensagem");
const gameOver = document.getElementById("gameOver");
const reiniciar = document.getElementById("reiniciar");

let vidas = 3;
let vitorias = 0;
let tempo = 0;
let jogoAtivo = true;
let pecaSelecionada = null;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let inimigoX = 100;
let inimigoY = 150;
let velocidadeInimigo = 1;
let velocidadeMaxima = 2.5;
let intervaloTempo;
let invulneravel = false;
const pecas = [];

function criarPecas() {
    pecas.forEach(function(peca) {
        peca.remove();
    });
    pecas.length = 0;
    for (let i = 1; i <= 9; i++) {
        const peca = document.createElement("div");
        peca.classList.add("peca");
        peca.classList.add("peca" + i);
        peca.dataset.numero = i;
        peca.textContent = i;
        jogo.appendChild(peca);
        pecas.push(peca);

        posicionarAleatoriamente(peca);
        peca.addEventListener("click", function(event) {
            event.stopPropagation();

            if (pecaSelecionada === peca) {
                const slot = encontrarSlot();
                if (slot) {
                    soltarPeca(slot);
                }
                return;
            }
            selecionarPeca(peca);
        });
    }
}

function posicionarAleatoriamente(peca) {
    const larguraJogo = jogo.clientWidth;
    const alturaJogo = jogo.clientHeight;
    const larguraPeca = peca.offsetWidth;
    const alturaPeca = peca.offsetHeight;
    const limiteSuperior = 120;
    const maxX = larguraJogo - larguraPeca;
    const maxY = alturaJogo - alturaPeca;
    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(
        limiteSuperior + Math.random() * (maxY - limiteSuperior)
    );
    peca.style.left = x + "px";
    peca.style.top = y + "px";
}

function selecionarPeca(peca) {
    if (!jogoAtivo) {
        return;
    }
    if (pecaSelecionada) {
        return;
    }
    pecaSelecionada = peca;
    peca.classList.add("selecionada");
    mensagem.textContent = "Quase lá! Falta levar ela até o quadrante correto e clicar novamente para encaixa-la";
}

document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (pecaSelecionada && jogoAtivo) {
        moverPeca();
    }
});

function moverPeca() {
    const larguraPeca = pecaSelecionada.offsetWidth;
    const alturaPeca = pecaSelecionada.offsetHeight;
    let x = mouseX - larguraPeca / 2;
    let y = mouseY - alturaPeca / 2;
    if (x < 0) {
        x = 0;
    }
    if (x > jogo.clientWidth - larguraPeca) {
        x = jogo.clientWidth - larguraPeca;
    }
    if (y < 0) {
        y = 0;
    }
    if (y > jogo.clientHeight - alturaPeca) {
        y = jogo.clientHeight - alturaPeca;
    }
    pecaSelecionada.style.left = x + "px";
    pecaSelecionada.style.top = y + "px";
}

jogo.addEventListener("click", function() {
    if (!pecaSelecionada) {
        return;
    }
    const slot = encontrarSlot();
    if (slot) {
        soltarPeca(slot);
    }
});

function encontrarSlot() {
    const areaPeca = pecaSelecionada.getBoundingClientRect();
    const centroX = areaPeca.left + areaPeca.width / 2;
    const centroY = areaPeca.top + areaPeca.height / 2;
    const slots = document.querySelectorAll(".slot");
    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const areaSlot = slot.getBoundingClientRect();
        if (
            centroX >= areaSlot.left &&
            centroX <= areaSlot.right &&
            centroY >= areaSlot.top &&
            centroY <= areaSlot.bottom
        ) {
            return slot;
        }
    }
    return null;
}

function soltarPeca(slot) {
    const numeroPeca = Number(pecaSelecionada.dataset.numero);
    const numeroSlot = Number(slot.dataset.posicao);
    if (numeroPeca !== numeroSlot) {
        mensagem.textContent = "O jogo não é a prova de João Victor ;(, lugar errado, mova para outro lugar!";
        return;
    }
    slot.classList.add("correto");
    slot.textContent = numeroPeca;
    pecaSelecionada.remove();
    const indice = pecas.indexOf(pecaSelecionada);
    if (indice !== -1) {
        pecas.splice(indice, 1);
    }
    pecaSelecionada = null;
    mensagem.textContent = "Boa! Continue montando o tabuleiro.";
    if (pecas.length === 0) {
        venceu();
    }
}

function venceu() {
    vitorias++;
    vitoriasTexto.textContent = vitorias;
    mensagem.textContent = "Você descobriu como é bom ficar em 1° lugar! Mas se prepare, a próxima rodada será mais difícil!";
    velocidadeInimigo += 0.25;
    velocidadeMaxima += 0.35;
    setTimeout(function() {
        iniciarNovaRodada();
    }, 1200);
}

function iniciarNovaRodada() {
    if (!jogoAtivo) {
        return;
    }
    tempo = 0;
    tempoTexto.textContent = tempo;
    criarPecas();
    const slots = document.querySelectorAll(".slot");
    slots.forEach(function(slot) {
        slot.classList.remove("correto");
        slot.textContent = "";
    });

    inimigoX = Math.random() * (window.innerWidth - 100);
    inimigoY = Math.random() * (window.innerHeight - 150) + 100;
    inimigo.style.left = inimigoX + "px";
    inimigo.style.top = inimigoY + "px";
    mensagem.textContent = "Nova rodada! O inimigo ficou mais rápido!";
}

intervaloTempo = setInterval(function() {
    if (!jogoAtivo) {
        return;
    }
    tempo++;
    tempoTexto.textContent = tempo;
    aumentarVelocidade();
}, 1000);

function aumentarVelocidade() {
    velocidadeInimigo += 0.03;
    if (velocidadeInimigo > velocidadeMaxima) {
        velocidadeInimigo = velocidadeMaxima;
    }
}

function moverInimigo() {
    if (!jogoAtivo) {
        return;
    }
    const distanciaX = mouseX - inimigoX;
    const distanciaY = mouseY - inimigoY;
    const distancia = Math.sqrt(
        distanciaX * distanciaX +
        distanciaY * distanciaY
    );
    if (distancia > 0) {
        inimigoX += (distanciaX / distancia) * velocidadeInimigo;
        inimigoY += (distanciaY / distancia) * velocidadeInimigo;
    }
    inimigo.style.left = inimigoX + "px";
    inimigo.style.top = inimigoY + "px";
    verificarColisao();
}

setInterval(function() {
    moverInimigo();
}, 16);

function verificarColisao() {
    if (invulneravel) {
        return;
    }
    const centroX = inimigoX + inimigo.offsetWidth / 2;
    const centroY = inimigoY + inimigo.offsetHeight / 2;
    const distanciaX = mouseX - centroX;
    const distanciaY = mouseY - centroY;
    const distancia = Math.sqrt(
        distanciaX * distanciaX +
        distanciaY * distanciaY
    );

    if (distancia < 35) {
        perderVida();
    }
}

function perderVida() {
    if (invulneravel) {
        return;
    }

    invulneravel = true;
    vidas--;
    vidasTexto.textContent = vidas;
    if (pecaSelecionada) {
        pecaSelecionada.classList.remove("selecionada");
        posicionarAleatoriamente(pecaSelecionada);
        pecaSelecionada = null;
    }
    mensagem.textContent =
        "Oh não, o inimigo te pegou, mas não aceite a afronta, siga em frente!";
    if (vidas <= 0) {
        finalizarJogo();
        return;
    }
    inimigoX = Math.random() * (window.innerWidth - 100);
    inimigoY = Math.random() * (window.innerHeight - 150) + 100;
    inimigo.style.left = inimigoX + "px";
    inimigo.style.top = inimigoY + "px";
    setTimeout(function() {
        invulneravel = false;
    }, 1000);
}

function finalizarJogo() {
    jogoAtivo = false;
    clearInterval(intervaloTempo);
    gameOver.classList.remove("escondido");
}

reiniciar.addEventListener("click", function() {
    location.reload();
});

alert("Um monstro apareceu destruindo toda a cidade de UZL city.");
alert("Você é o último sobrevivente... pelo menos por enquanto.");
alert("Para escapar, você precisa reconstruir o poder de UZL city.");
alert("Em cada rodada, coloque os quadrados mágicos nos seus lugares correspondentes.");
alert("Tente ser rápido, quanto mais tempo demorar, mais rápido ele fica.");
alert("Nesse mundo distópico, a sua única certeza é de que terá que fazer essa tarefa dia após dia!");

criarPecas();

inimigo.style.left = inimigoX + "px";
inimigo.style.top = inimigoY + "px";
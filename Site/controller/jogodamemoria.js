document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const perfilId = localStorage.getItem('perfilId');

    // Verificações de segurança
    if (!userId) {
        alert('Você precisa estar logado.');
        window.location.href = '../index.html';
        return;
    }

    if (!perfilId) {
        alert('Selecione um perfil primeiro.');
        window.location.href = 'perfil.html';
        return;
    }

// Aqui você pode continuar carregando os dados da atividade com o perfilId
    console.log('Usuário logado:', userId);
    console.log('Perfil selecionado:', perfilId);
});

document.getElementById('btnLogout').addEventListener('click', () => {
    window.location.href = 'atividade.html';
});


let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let score = 0;
let moves = 0;
let acertos = 0;
let erros = 0;

let timerInterval = null;
let elapsedTimeInSeconds = 0;
let timerStarted = false;

const cardDataMap = new Map();

// Embaralha array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length -1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i +1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Cria um card individual com vídeo
function createCard(cardData, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = index;

    // Armazena os dados fora do DOM
    cardDataMap.set(card, cardData);

    card.innerHTML = `
        <div class="card-front">❓</div>
        <div class="card-back">
            <video src="${cardData.video}" muted loop playsinline class="card-video"></video>
            <div class="card-text">${cardData.text}</div>
        </div>
    `;

    card.addEventListener('click', flipCard);
    return card;
}

// Vira card
function flipCard() {
    if (flippedCards.length >= 2) return;
    if (this.classList.contains('flipped') || this.classList.contains('matched')) return;

    if (!timerStarted) {
        startTimer();
        timerStarted = true;
    }

    this.classList.add('flipped');
    flippedCards.push(this);

    // Play vídeo ao virar
    const video = this.querySelector('video');
    if (video) {
        video.currentTime = 0;
        video.play();
    }

    if (flippedCards.length === 2) {
        moves++;
        document.getElementById('moves').textContent = moves;
        checkMatch();
    }
}

// Verifica match
function checkMatch() {
    const [card1, card2] = flippedCards;
    const data1 = cardDataMap.get(card1);
    const data2 = cardDataMap.get(card2);

    const match = data1.video === data2.video && data1.text === data2.text;

    setTimeout(() => {
        if (match) {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.classList.add('matched');
            card2.classList.add('matched');

            card1.innerHTML = `
                <div class="matched-card">
                    <div class="matched-card">
                    <video src="${data1.video}" muted autoplay loop playsinline class="card-video"></video>
                    <div class="card-text">${data1.text}</div>
                </div>
                </div>
            `;
            card2.innerHTML = `
                <div class="matched-card">
                    <video src="${data2.video}" muted autoplay loop playsinline class="card-video"></video>
                    <div class="card-text">${data2.text}</div>
                </div>
            `;

            matchedPairs++;
            acertos++;
            score += 100;
            document.getElementById('score').textContent = score;

            if (matchedPairs === cards.length / 2) {
                stopTimer();
                setTimeout(showVictory, 500);
            }
        } else {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            score = Math.max(0, score - 10);
            erros++;
            document.getElementById('score').textContent = score;
        }
        flippedCards = [];
    }, 1500); // tempo maior para desvirar
}

// Modal vitória
async function showVictory() {
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalMoves').textContent = moves;
    document.getElementById('finalAcertos').textContent = acertos;
    document.getElementById('finalErros').textContent = erros;
    document.getElementById('finalTime').textContent = formatTime(elapsedTimeInSeconds);

    document.getElementById('victoryModal').classList.add('show');

    // Envia resultado para o backend
    const tempoFormatado = formatTime(elapsedTimeInSeconds);
    await enviarResultadoParaBanco(acertos, erros, score, tempoFormatado, 3);
}

// Fecha modal e reinicia
function closeModal() {
    document.getElementById('victoryModal').classList.remove('show');
    startJogoMemoria();
}

// Formata segundos para HH:mm:ss
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2,'0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2,'0');
    const s = (seconds % 60).toString().padStart(2,'0');
    return `${h}:${m}:${s}`;
}

// Timer
function startTimer() {
    elapsedTimeInSeconds = 0;
    timerInterval = setInterval(() => {
        elapsedTimeInSeconds++;
        document.getElementById('finalTime').textContent = formatTime(elapsedTimeInSeconds);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerStarted = false;
}

// Busca dados do JSON aleatório (2 arquivos)
async function fetchCardsData() {
    // Pega a aula escolhida do localStorage
    const aulaEscolhida = localStorage.getItem('aulaescolhida');
    if (!aulaEscolhida) {
        alert('Nenhuma aula selecionada!');
        return;
    }    
    try {
        const selectedFile = `jgmemoria${aulaEscolhida}.json`;

        console.log('Arquivo escolhido:', selectedFile);

        const response = await fetch(`../model/${selectedFile}`);
        if (!response.ok) throw new Error(`Erro ao carregar ${selectedFile}`);
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar os dados do quiz:', error);
        return [];
    }
}

// Envia resultado para o banco via POST
async function enviarResultadoParaBanco(acertos, erros, score, tempo, Fk_crianca) {
    const perfilId = localStorage.getItem('perfilId');
    const payload = {
        Acertos: acertos,
        Erros: erros,
        Moedas: score,
        Tempo: tempo,
        Fk_Crianca: perfilId
    };

    try {
        const response = await fetch('https://localhost:7121/Atividade/InserirAtividade', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Erro ao enviar dados: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Dados enviados com sucesso:', data);
        return data;

    } catch (error) {
        console.error('Falha ao enviar resultado para o banco:', error);
    }
}

// Inicia o jogo
async function startJogoMemoria() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    flippedCards = [];
    matchedPairs = 0;
    score = 0;
    moves = 0;
    acertos = 0;
    erros = 0;
    elapsedTimeInSeconds = 0;
    timerStarted = false;
    if (timerInterval) clearInterval(timerInterval);

    document.getElementById('score').textContent = score;
    document.getElementById('moves').textContent = moves;
    document.getElementById('finalTime').textContent = '00:00:00';

    const cardsData = await fetchCardsData();
    const duplicatedCards = [...cardsData, ...cardsData];
    cards = shuffleArray(duplicatedCards);

    cards.forEach((cardData, index) => {
        const card = createCard(cardData, index);
        gameBoard.appendChild(card);
    });
}

function voltarMenu() {
    document.getElementById('victoryModal').classList.remove('show');
    window.location.href = "../view/atividade.html";
}

startJogoMemoria();

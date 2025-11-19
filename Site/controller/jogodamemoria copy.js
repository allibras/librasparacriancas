let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let score = 0;
let moves = 0;
let acertos = 0;
let erros = 0;

// Timer
let startTime = null;
let timerInterval = null;
let elapsedTime = 0;

// Mapa para armazenar os dados dos cards fora do DOM
const cardDataMap = new Map();

// Embaralha os cards
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
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

// Inicia o timer do jogo
function startTimer() {
    if (startTime !== null) return; // já iniciado
    startTime = Date.now();
    timerInterval = setInterval(() => {
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        // Opcional: mostrar tempo em algum lugar, ex: 
        // document.getElementById('timer').textContent = elapsedTime + 's';
    }, 1000);
}

// Para o timer
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// Reseta o timer
function resetTimer() {
    stopTimer();
    startTime = null;
    elapsedTime = 0;
    // Se tiver elemento visível do timer, resetar também:
    // document.getElementById('timer').textContent = '0s';
}

// Vira o card
function flipCard() {
    if (flippedCards.length >= 2) return;
    if (this.classList.contains('flipped') || this.classList.contains('matched')) return;

    // Inicia o timer na primeira virada
    if (startTime === null) {
        startTimer();
    }

    this.classList.add('flipped');
    flippedCards.push(this);

    // Força o vídeo a tocar
    const video = this.querySelector('video');
    if (video) {
        video.play().catch(err => {
            console.warn('Erro ao tentar reproduzir o vídeo:', err);
        });
    }

    if (flippedCards.length === 2) {
        moves++;
        document.getElementById('moves').textContent = moves;
        checkMatch();
    }
}

// Verifica se dois cards são iguais
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
                    <video src="${data1.video}" muted autoplay loop playsinline class="card-video"></video>
                    <div class="card-text">${data1.text}</div>
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
                // Para o timer ao finalizar o jogo
                stopTimer();
                setTimeout(showVictory, 500);
            }
        } else {
            // Par errado: desvira e pausa vídeos
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');

            const video1 = card1.querySelector('video');
            const video2 = card2.querySelector('video');
            if (video1) video1.pause();
            if (video2) video2.pause();

            score = Math.max(0, score - 10);
            erros++;
            document.getElementById('score').textContent = score;
        }
        flippedCards = [];
    }, 2000);
}

// Mostra modal de vitória
function showVictory() {
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalMoves').textContent = moves;
    document.getElementById('finalAcertos').textContent = acertos;
    document.getElementById('finalErros').textContent = erros;
    document.getElementById('finalTime').textContent = formatTime(elapsedTime);
    document.getElementById('victoryModal').classList.add('show');
}

// Formata o tempo (segundos) em mm:ss
function formatTime(seconds) {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
}

// Fecha modal e reinicia jogo
function closeModal() {
    document.getElementById('victoryModal').classList.remove('show');
    startGame();
}

// Carrega dados do JSON externo
async function fetchCardsData() {
    try {
        const randomIndex = Math.floor(Math.random() * 2) + 1;
        const selectedFile = `jgmemoria${randomIndex}.json`;
        console.log('Arquivo escolhido:', selectedFile);
        // Faz o fetch do arquivo escolhido
        const response = await fetch(`../model/${selectedFile}`);
        if (!response.ok) throw new Error(`Erro ao carregar ${selectedFile}`);
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar os dados dos cards:', error);
        return [];
    }
}


// Inicia o jogo
async function startGame() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    flippedCards = [];
    matchedPairs = 0;
    score = 0;
    moves = 0;
    acertos = 0;
    erros = 0;
    resetTimer();

    document.getElementById('score').textContent = score;
    document.getElementById('moves').textContent = moves;
    document.getElementById('finalTime').textContent = '00:00';

    const cardsData = await fetchCardsData();

    const duplicatedCards = [...cardsData, ...cardsData];
    cards = shuffleArray(duplicatedCards);

    cards.forEach((cardData, index) => {
        const card = createCard(cardData, index);
        gameBoard.appendChild(card);
    });
}

// Começa o jogo ao carregar a página
startGame();




// Atualização Banco de Dados

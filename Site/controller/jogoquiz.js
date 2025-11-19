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


// Quiz

let signsData = [];  // Dados carregados via fetch

let score = 0;
let acertos = 0;
let erros = 0;
let perguntasRespondidas = 0;
const maxPerguntas = 5;

let perguntasSorteadas = [];
let perguntaAtualIndex = 0;

// Timer variables
let elapsedTimeInSeconds = 0;
let timerInterval = null;
let timerStarted = false;

// Função para formatar o tempo em HH:mm:ss
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2,'0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2,'0');
    const s = (seconds % 60).toString().padStart(2,'0');
    return `${h}:${m}:${s}`;
}

// Função que embaralha um array (Fisher-Yates)
function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Prepara as perguntas sorteadas para o quiz (sem repetição)
function prepararPerguntas() {
    perguntasSorteadas = [...signsData];
    embaralharArray(perguntasSorteadas);
    perguntasSorteadas = perguntasSorteadas.slice(0, maxPerguntas);
    perguntaAtualIndex = 0;
}

// Carrega a pergunta atual e opções (vídeos)
function loadQuiz() {
    if (perguntaAtualIndex >= perguntasSorteadas.length) {
        showVictory();
        return;
    }

    const currentSign = perguntasSorteadas[perguntaAtualIndex];

    document.getElementById('quizQuestion').textContent = `Qual é o sinal para "${currentSign.word}"?`;

    const options = [currentSign];
    while (options.length < 4) {
        const randomSign = signsData[Math.floor(Math.random() * signsData.length)];
        if (!options.some(option => option.word === randomSign.word)) {
            options.push(randomSign);
        }
    }

    options.sort(() => Math.random() - 0.5);

    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';

    options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';

        const videoEl = document.createElement('video');
        videoEl.src = option.video;
        videoEl.width = 120;
        videoEl.height = 90;
        videoEl.controls = false;
        videoEl.muted = true;
        videoEl.loop = true;
        videoEl.autoplay = true;

        optionDiv.appendChild(videoEl);

        optionDiv.onclick = () => checkQuizAnswer(option.word === currentSign.word, optionDiv);
        optionsContainer.appendChild(optionDiv);
    });
}

// Função para iniciar o timer
function startTimer() {
    elapsedTimeInSeconds = 0;
    timerInterval = setInterval(() => {
        elapsedTimeInSeconds++;
    }, 1000);
    timerStarted = true;
}

// Função para parar o timer
function stopTimer() {
    clearInterval(timerInterval);
    timerStarted = false;
}

// Checa a resposta selecionada pelo usuário
function checkQuizAnswer(isCorrect, element) {
    if (!timerStarted) {
        startTimer();
    }

    // Desabilita cliques momentaneamente
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.style.pointerEvents = 'none';
    });

    if (isCorrect) {
        element.classList.add('correct');
        acertos++;
        score += 100;
        perguntasRespondidas++;
        perguntaAtualIndex++; // Só avança quando acerta

        setTimeout(() => {
            loadQuiz();
        }, 1000);

    } else {
        element.classList.add('wrong');
        erros++;
        score = Math.max(0, score - 20);

        // Permite tentar novamente a mesma pergunta após mostrar o erro
        setTimeout(() => {
            element.classList.remove('wrong');
            document.querySelectorAll('.quiz-option').forEach(opt => {
                opt.style.pointerEvents = 'auto';
            });
        }, 800);
    }
}

// Função para buscar os dados via fetch
async function fetchQuizData() {
    // Pega a aula escolhida do localStorage
    const aulaEscolhida = localStorage.getItem('aulaescolhida');
    if (!aulaEscolhida) {
        alert('Nenhuma aula selecionada!');
        return;
    }    
    try {
        const selectedFile = `jgquiz${aulaEscolhida}.json`;

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

// Mostra o modal de vitória com os resultados e tempo
async function showVictory() {
    stopTimer();

    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalAcertos').textContent = acertos;
    document.getElementById('finalErros').textContent = erros;
    document.getElementById('finalTime').textContent = formatTime(elapsedTimeInSeconds);

    document.getElementById('victoryModal').classList.add('show');

    const tempoFormatado = formatTime(elapsedTimeInSeconds);
    await enviarResultadoParaBanco(acertos, erros, score, tempoFormatado, 3);
}

// Fecha o modal e reinicia o quiz
function closeModal() {
    document.getElementById('victoryModal').classList.remove('show');

    score = 0;
    acertos = 0;
    erros = 0;
    perguntasRespondidas = 0;

    stopTimer();
    elapsedTimeInSeconds = 0;

    prepararPerguntas();
    loadQuiz();
}

// Inicialização: busca os dados e inicia o quiz
async function initQuiz() {
    signsData = await fetchQuizData();

    if (signsData.length === 0) {
        alert('Erro ao carregar dados do quiz. Tente novamente mais tarde.');
        return;
    }

    prepararPerguntas();
    loadQuiz();
}

function voltarMenu() {
    document.getElementById('victoryModal').classList.remove('show');
    window.location.href = "../view/atividade.html";
}

// Chama a inicialização
initQuiz();
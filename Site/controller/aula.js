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

    console.log('Usuário logado:', userId);
    console.log('Perfil selecionado:', perfilId);
});

document.getElementById('btnLogout').addEventListener('click', () => {
    window.location.href = 'atividade.html';
});


let dados = [];
let indexAtual = 0;
let repeticoesVideo = 0;

document.addEventListener("DOMContentLoaded", async () => {
    // Pega a aula escolhida do localStorage
    const aulaEscolhida = localStorage.getItem('aulaescolhida');
    if (!aulaEscolhida) {
        alert('Nenhuma aula selecionada!');
        return;
    }

    // Monta o nome do arquivo JSON baseado no nome da aula
    const nomeArquivoJson = `../model/aula${aulaEscolhida}.json`;

    console.log('Carregando arquivo JSON:', nomeArquivoJson);

    try {
        const res = await fetch(nomeArquivoJson);
        dados = await res.json();
        carregarSlide(indexAtual);
    } catch (e) {
        console.error("Erro ao carregar JSON:", e);
    }

    document.getElementById("voltar").addEventListener("click", () => {
        if (indexAtual > 0) {
            indexAtual--;
            carregarSlide(indexAtual);
        }
    });

    document.getElementById("avancar").addEventListener("click", () => {
        if (indexAtual < dados.length - 1) {
            indexAtual++;
            carregarSlide(indexAtual);
        }
    });

    document.getElementById("terminar").addEventListener("click", () => {
        window.location.href = "../view/atividade.html";
    });

    document.getElementById("repetir").addEventListener("click", () => {
        const video = document.getElementById("video");
        if (video.style.display !== "none") {
            video.currentTime = 0;
            video.playbackRate = 1.0;
            video.play();
            repeticoesVideo++;
            if (repeticoesVideo >= 2) {
                document.getElementById("repetir-lento").style.display = "inline-block";
            }
        }
    });

    document.getElementById("repetir-lento").addEventListener("click", () => {
        const video = document.getElementById("video");
        if (video.style.display !== "none") {
            video.currentTime = 0;
            video.playbackRate = 0.5;
            video.play();
        }
    });
});

function carregarSlide(index) {
    const sprite = document.getElementById("sprite");
    const fala = document.getElementById("fala");
    const imagem = document.getElementById("imagem");
    const video = document.getElementById("video");

    const item = dados[index];

    sprite.src = item.sprite;
    fala.textContent = item.fala;

    const temVideo = item.video !== undefined;

    if (temVideo) {
        // Mostrar vídeo
        video.src = item.video;
        video.controls = false;
        video.style.display = "block";

        imagem.style.display = "none";
        video.playbackRate = 1.0;
        video.currentTime = 0;
        video.play();

        document.getElementById("repetir").style.display = "inline-block";
        document.getElementById("repetir-lento").style.display = repeticoesVideo >= 2 ? "inline-block" : "none";
    } else {
        // Mostrar imagem
        imagem.src = item.imagem;
        imagem.style.display = "block";

        video.pause();
        video.style.display = "none";
        document.getElementById("repetir").style.display = "none";
        document.getElementById("repetir-lento").style.display = "none";
        repeticoesVideo = 0; // Reset por slide sem vídeo
    }

    document.getElementById("voltar").style.display = index === 0 ? "none" : "inline-block";
    document.getElementById("avancar").style.display = index === dados.length - 1 ? "none" : "inline-block";
    document.getElementById("terminar").style.display = index === dados.length - 1 ? "inline-block" : "none";
}

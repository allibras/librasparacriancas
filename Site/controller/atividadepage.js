document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const perfilId = localStorage.getItem('perfilId');

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

    const aulas = [
        { nome: 'Animais', chaveLocalStorage: 'animal', imagem: '../jogos/fundoanimais.png', url: '../view/aula.html' },
        { nome: 'Comprimentos', chaveLocalStorage: 'comprimento', imagem: '../jogos/comprimento.png', url: '../view/aula.html' }
    ];

    const jogos = [
        { nome: 'Jogo da Memória', imagem: '../jogos/jogodamemorialogo.png', url: '../view/jogodamemoria.html' },
        { nome: 'Quiz', imagem: '../jogos/quizfundo.png', url: '../view/jogoquiz.html' }
    ];

    const containerAtividades = document.getElementById('atividades');
    containerAtividades.innerHTML = '';

    // Cria o botão fixo de atualizar
    criarBotaoAtualizar();

    renderTemas();

    function renderTemas() {
        const secaoTemas = criarSecaoFichas('Escolha um Tema', aulas, true, true);
        containerAtividades.appendChild(secaoTemas);
    }

    function renderAulaEGames(aula) {
        containerAtividades.querySelectorAll('.secao-fichas').forEach(el => el.remove());

        const secaoAula = criarSecaoFichas('Aula', [aula], false, true);
        containerAtividades.appendChild(secaoAula);

        const secaoJogos = criarSecaoFichas('Jogos', jogos, false, false);
        containerAtividades.appendChild(secaoJogos);

        // Exibe o botão quando a aula é carregada
        const btnAtualizar = document.getElementById('btn-atualizar');
        if (btnAtualizar) btnAtualizar.style.display = 'block';
    }

    function criarSecaoFichas(titulo, itens, salvaLocalStorage, isAula) {
        const secao = document.createElement('section');
        secao.classList.add('secao-fichas');

        const h2 = document.createElement('h2');
        h2.textContent = titulo;
        h2.style.textAlign = 'center';
        h2.style.marginBottom = '16px';
        secao.appendChild(h2);

        const container = document.createElement('div');
        container.classList.add('fichas-container');

        itens.forEach(item => {
            const ficha = document.createElement('div');
            ficha.classList.add('ficha-crianca');
            ficha.innerHTML = `
                <img src="${item.imagem}" alt="${item.nome}" />
                <h3>${item.nome}</h3>
            `;

            ficha.onclick = () => {
                if (isAula) {
                    localStorage.setItem('aulaescolhida', item.chaveLocalStorage);
                    if (salvaLocalStorage) {
                        renderAulaEGames(item);
                    } else {
                        window.location.href = item.url;
                    }
                } else {
                    window.location.href = item.url;
                }
            };

            container.appendChild(ficha);
        });

        secao.appendChild(container);
        return secao;
    }

    function criarBotaoAtualizar() {
        const btnAtualizar = document.createElement('button');
        btnAtualizar.id = 'btn-atualizar';
        btnAtualizar.textContent = '    Voltar    ';

        btnAtualizar.style.position = 'fixed';
        btnAtualizar.style.bottom = '20px';
        btnAtualizar.style.left = '50%';
        btnAtualizar.style.transform = 'translateX(115%)';
        btnAtualizar.style.zIndex = '9999';
        btnAtualizar.style.padding = '12px 20px';
        btnAtualizar.style.borderRadius = '10px';
        btnAtualizar.style.border = 'none';
        btnAtualizar.style.backgroundColor = '#1976d2';
        btnAtualizar.style.color = '#fff';
        btnAtualizar.style.fontSize = '16px';
        btnAtualizar.style.cursor = 'pointer';
        btnAtualizar.style.display = 'none'; // começa escondido
        btnAtualizar.onmouseover = () => btnAtualizar.style.backgroundColor = '#1565c0';
        btnAtualizar.onmouseout = () => btnAtualizar.style.backgroundColor = '#1976d2';

        btnAtualizar.onclick = () => location.reload();

        document.body.appendChild(btnAtualizar);
    }
});

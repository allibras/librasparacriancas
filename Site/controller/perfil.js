document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        alert('Você precisa estar logado.');
        window.location.href = '../index.html';
        return;
    }

    const conteudoDiv = document.getElementById('conteudo');
    conteudoDiv.innerHTML = ''; // limpa o conteúdo

    try {
        const resposta = await fetch(`https://localhost:7121/Perfil/${userId}`);

        // Se a API responder com erro (ex: 404), forçamos o fluxo de erro
        if (!resposta.ok) {
            throw new Error(`Erro ${resposta.status}`);
        }

        const criancas = await resposta.json();

        // Container para os elementos (fichas + botão)
        const container = document.createElement('div');
        container.classList.add('container');

        if (criancas.length > 0) {
            // Mostra fichas das crianças
            const fichasContainer = document.createElement('div');
            fichasContainer.classList.add('fichas-container');

            criancas.forEach(crianca => {
                const ficha = document.createElement('div');
                ficha.classList.add('ficha-crianca');

                ficha.innerHTML = `
                    <img src="../jogos/iconprovisorio.png" alt="Foto de ${crianca.nome}" />
                    <h3>${crianca.nome}</h3>
                    <p>ID: ${crianca.id}</p>
                `;

                ficha.style.cursor = 'pointer';
                ficha.onclick = () => {
                    localStorage.setItem('perfilId', crianca.id);
                    window.location.href = 'atividade.html';
                };

                fichasContainer.appendChild(ficha);
            });

            container.appendChild(fichasContainer);

            // botão criar perfil (visível apenas se houver crianças)
            const btnWrapper = document.createElement('div');
            btnWrapper.classList.add('btn-wrapper');

            const btnCriar = document.createElement('button');
            btnCriar.textContent = 'Criar Perfil';
            btnCriar.classList.add('btn-criar-perfil');
            btnCriar.onclick = () => {
                mostrarFormulario();
            };

            btnWrapper.appendChild(btnCriar);
            container.appendChild(btnWrapper);
            conteudoDiv.appendChild(container);

        } else {
            // Se não houver nenhuma criança, mostra o formulário diretamente
            mostrarFormulario();
        }

    } catch (err) {
        console.error('Erro ao buscar crianças:', err);

        // Se o controller devolver erro (ex: 404), mostra o formulário
        document.getElementById("createPerfil").style.display = "block";
        document.getElementById("conteudo").style.display = "none";
    }
});

// Logout: apaga todo o localStorage
document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../index.html';
});

// Mostrar formulário de criação de perfil
function mostrarFormulario() {
    document.getElementById("createPerfil").style.display = "block";
    document.getElementById("conteudo").style.display = "none";
}

// Fechar formulário com o "x"
document.getElementById('closeCreatePerfil').addEventListener('click', () => {
    document.getElementById('createPerfil').style.display = 'none';
    document.getElementById('conteudo').style.display = 'block';
});

// Criar perfil (formulário)
document.getElementById('formPerfil').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const data_Nascimento = document.getElementById('data').value;
    const apelido = document.getElementById('apelido').value;
    const parentesco = document.getElementById('parentesco').value;
    const serie_escolar = document.getElementById('serie_escolar').value;
    const fk_responsavel = localStorage.getItem('userId');

    // Formatar data
    const [anoStr, mesStr, diaStr] = data_Nascimento.split('-');
    const ano = parseInt(anoStr, 10);
    const mes = parseInt(mesStr, 10) - 1;
    const dia = parseInt(diaStr, 10);

    const dataObj = new Date(ano, mes, dia);
    const anoFormatado = dataObj.getFullYear();
    const mesFormatado = String(dataObj.getMonth() + 1).padStart(2, '0');
    const diaFormatado = String(dataObj.getDate()).padStart(2, '0');
    const dataFormatada = `${anoFormatado}-${mesFormatado}-${diaFormatado}`;

    const dados = {
        nome,
        data_Nascimento: dataFormatada,
        apelido,
        parentesco,
        serie_escolar,
        fk_responsavel
    };

    try {
        const resposta = await fetch('https://localhost:7121/Perfil', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (resposta.ok) {
            window.location.reload();
        } else {
            const erro = await resposta.text();
            alert('Erro: ' + erro);
        }
    } catch (err) {
        console.error(err);
        alert('Erro na conexão com o servidor.');
    }
});

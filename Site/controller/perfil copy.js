document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        alert('Você precisa estar logado.');
        window.location.href = 'login.html';
        return;
    }

    const conteudoDiv = document.getElementById('conteudo');
    conteudoDiv.innerHTML = ''; // limpa o conteúdo

    try {
        const resposta = await fetch(`https://localhost:7121/Perfil/${userId}`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar crianças");
        }

        const criancas = await resposta.json();

        // Container para os elementos (lista + botão)
        const container = document.createElement('div');
        container.classList.add('container');

        // Se houver crianças, exibir lista
        if (criancas.length > 0) {
            const lista = document.createElement('ul');
            lista.classList.add('lista-criancas');

            criancas.forEach(crianca => {
                const item = document.createElement('li');
                item.textContent = `${crianca.nome} - Id: ${crianca.id}`;
                item.classList.add('item-crianca');
                item.style.cursor = 'pointer'; // visual de clicável

                // Quando clicar no perfil da criança
                item.onclick = () => {
                    localStorage.setItem('perfilId', crianca.id);
                    window.location.href = 'atividade.html';
                };

                lista.appendChild(item);
            });

            container.appendChild(lista);
        }

        // Botão de criar perfil (sempre exibe)
        const btnCriar = document.createElement('button');
        btnCriar.textContent = 'Criar Perfil';
        btnCriar.classList.add('btn-criar-perfil');
        btnCriar.onclick = () => {
            mostrarFormulario();
        };

        container.appendChild(btnCriar);

        conteudoDiv.appendChild(container);

    } catch (err) {
        console.error(err);
        // Em caso de erro, mostrar só o botão Criar Perfil centralizado
        const container = document.createElement('div');
        container.classList.add('container-erro');

        const btnCriar = document.createElement('button');
        btnCriar.textContent = 'Criar Perfil';
        btnCriar.classList.add('btn-criar-perfil');
        btnCriar.onclick = () => {
            mostrarFormulario();
        };

        container.appendChild(btnCriar);
        conteudoDiv.appendChild(container);
    }
});

// Logout: apaga todo o localStorage
document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.clear(); // limpa tudo
    window.location.href = 'login.html';
});


// Criar perfil
function mostrarFormulario() {
    document.getElementById("createPerfil").style.display = "block";
    document.getElementById("conteudo").style.display = "none";
}

document.getElementById('formPerfil').addEventListener('submit', async function (e) {
    e.preventDefault(); // cancela o submit padrão

    const nome = document.getElementById('nome').value;
    const data_Nascimento = document.getElementById('data').value; // espera 'YYYY-MM-DD'
    const apelido = document.getElementById('apelido').value;
    const parentesco = document.getElementById('parentesco').value;
    const serie_escolar = document.getElementById('serie_escolar').value;
    const fk_responsavel = localStorage.getItem('userId');

    const [anoStr, mesStr, diaStr] = data_Nascimento.split('-');
    const ano = parseInt(anoStr, 10);
    const mes = parseInt(mesStr, 10) - 1;
    const dia = parseInt(diaStr, 10);

    const dataObj = new Date(ano, mes, dia); // horário local

    const anoFormatado = dataObj.getFullYear();
    const mesFormatado = String(dataObj.getMonth() + 1).padStart(2, '0');
    const diaFormatado = String(dataObj.getDate()).padStart(2, '0');
    const dataFormatada = `${anoFormatado}-${mesFormatado}-${diaFormatado}`;

    console.log(dataFormatada);

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
            //alert('Usuário cadastrado com sucesso!');
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
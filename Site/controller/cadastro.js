document.getElementById('formCadastro').addEventListener('submit', async function (e) {
    e.preventDefault(); // cancela o submit padrão

    const nome = document.getElementById('nomecad').value;
    const email = document.getElementById('emailcad').value;
    const senha = document.getElementById('senhacad').value;

    const dados = { nome, email, senha };

    try {
        const resposta = await fetch('https://localhost:7121/Cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (resposta.ok) {
            const respostaJson = await resposta.json();
            //alert('Usuário cadastrado com sucesso!');

            // Armazena apenas o ID do usuário
            localStorage.setItem('userId', respostaJson.id);

            // Redireciona para outra página
            window.location.href = 'view/perfil.html';
        } else {
            const erro = await resposta.text();
            alert('Erro: ' + erro);
        }
    } catch (err) {
        console.error(err);
        alert('Erro na conexão com o servidor.');
    }
});
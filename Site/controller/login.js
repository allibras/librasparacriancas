document.getElementById('formLogin').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const dados = { email, senha };

    try {
        const resposta = await fetch('https://localhost:7121/Login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (resposta.ok) {
            const respostaJson = await resposta.json();

            // Armazena apenas o ID do usuário
            localStorage.setItem('userId', respostaJson.id);

            //alert('Login realizado com sucesso!');
            window.location.href = 'view/perfil.html';
        } else {
            const erro = await resposta.text();
            alert('Email e(ou) senha incorreto!');
            openModal('login');
        }
    } catch (err) {
        console.error(err);
        alert('Erro na conexão com o servidor.');
    }
});

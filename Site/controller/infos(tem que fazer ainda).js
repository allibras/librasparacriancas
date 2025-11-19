const userId = localStorage.getItem('userId');

    if (!userId) {
        alert('Você precisa estar logado.');
        window.location.href = '../index.html';
        return;
    }try {
        const resposta = await fetch(`https://localhost:7121/Perfil/${userId}`);
        

        const criancas = await resposta.json();

    } catch (err) {
        console.error('Erro ao buscar crianças:', err);

    }

    // deixar de canto o nome do perfil e as moedas
    // eu quero um js que vai ficar em todas as paginas no msm lugar, o objetivo dele é a partir de um fetch mostrar uma informação (moedinhas que tem no total e o nome do perfil logado). O nome do perfil e as moedas serao pegos atraves de um fetch tipo esse (vou mandar o codigo) A ideia é que essas infos fiquem no canto superior direito sem atrapalhar nada e sem ser atrapalhado ->
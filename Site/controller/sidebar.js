// Criar o botão vermelho dinamicamente no rodapé da sidebar
const bottomArea = document.getElementById("bottomArea");

const btnTrocarPerfil = document.createElement("button");
btnTrocarPerfil.textContent = "Trocar perfil";
btnTrocarPerfil.classList.add("btn-trocar-perfil");

btnTrocarPerfil.onclick = () => {
    localStorage.removeItem("perfilId");
    window.location.href = 'perfil.html';
};

bottomArea.appendChild(btnTrocarPerfil);

// Função para mostrar a seção correta
function mostrarSecao(secaoId) {
    document.querySelectorAll(".conteudo-section")
        .forEach(sec => sec.classList.remove("show")); // esconde todas

    const secao = document.getElementById(secaoId);
    if (secao) {
        secao.classList.add("show"); // mostra a correta
    }

    // Se a seção for Atividades, atualiza a página
    if (secaoId === 'atividades') {
        location.reload();
    }
}

// Clique do menu
document.querySelectorAll(".menu-opcoes li").forEach(item => {
    item.addEventListener("click", () => {
        // Remove a classe active de todos os itens
        document.querySelectorAll(".menu-opcoes li")
            .forEach(li => li.classList.remove("active"));

        // Adiciona active ao item clicado
        item.classList.add("active");

        // Mostra o contêiner correspondente
        const secao = item.getAttribute("data-section");
        mostrarSecao(secao);
    });
});

function obterDados() {
  const genero = document.getElementById("generoSelect").value;
  const busca = document.getElementById("busca").value;

  fetch(`/api/externo?genero=${genero}&busca=${busca}`)
    .then((response) => response.json())
    .then((dados) => {
      const resultadosDiv = document.getElementById("resultados");
      resultadosDiv.innerHTML = "";
      dados.forEach((dado, index) => {
        const pessoaDiv = document.createElement("div");
        pessoaDiv.className = "user-entry";
        pessoaDiv.innerHTML = `
          <input type="checkbox" class="user-select" data-user='${JSON.stringify(
            dado
          )}'>
          <p>Nome: ${dado.nome}</p>
          <p>Data de Nascimento: ${dado.data}</p>
          <p>Gênero: ${dado.genero}</p>
          <p>Email: ${dado.email}</p>
          <p>Telefone: ${dado.tel_residencial}</p>
          <p>Celular: ${dado.tel_celular}</p>
          <p>Endereço: ${dado.endereco}</p>
          <img src="${dado.imagem}" alt="Foto de ${
          dado.nome
        }" class="user-image">
        `;
        resultadosDiv.appendChild(pessoaDiv);
      });
      document.getElementById("resultados").classList.remove("hidden");
      document.getElementById("salvarBtn").disabled = false;
    })
    .catch((error) => {
      console.error("Erro ao buscar dados:", error);
      alert("Falha ao buscar dados.");
    });
}

function salvarDados() {
  const checkboxes = document.querySelectorAll(".user-select:checked");
  if (checkboxes.length === 0) {
    alert("Nenhum dado foi selecionado para salvar.");
    return;
  }
  const dadosParaSalvar = Array.from(checkboxes).map((cb) =>
    JSON.parse(cb.getAttribute("data-user"))
  );

  fetch("/api/salvar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosParaSalvar),
  })
    .then((response) => response.json())
    .then((result) => {
      alert("Dados salvos com sucesso!");
      console.log(result);
    })
    .catch((error) => {
      console.error("Erro ao salvar dados:", error);
      alert("Falha ao salvar dados.");
    });
}

function showSection(sectionId) {
  // Esconde todas as seções
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.add("hidden");
  });

  // Mostra a seção específica
  document.getElementById(sectionId).classList.remove("hidden");
}

function deletarUsuario() {
  const userId = document.getElementById("deleteUserId").value;
  fetch(`/api/deletar/${userId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.mensagem || data.erro);
    })
    .catch((error) => {
      console.error("Erro ao deletar o usuário:", error);
      alert("Falha ao deletar o usuário.");
    });
}



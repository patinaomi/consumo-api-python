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

function consultarUsuario() {
  const userId = document.getElementById("userId").value;
  fetch(`/api/consultar/${userId}`)
    .then((response) => response.json())
    .then((data) => {
      const userDiv = document.getElementById("dadosUsuario");
      if (data.erro) {
        alert(data.erro);
        userDiv.innerHTML = ""; // Limpar conteúdo anterior
        userDiv.classList.add("hidden");
      } else {
        userDiv.innerHTML = `
          <h2>Id: ${data.id}</h2>
          <p>Nome: ${data.nome}</p>
          <p>Data de Nascimento: ${data.data}</p>
          <p>Gênero: ${data.genero}</p>
          <p>Email: ${data.email}</p>
          <p>Telefone Residencial: ${data.tel_residencial}</p>
          <p>Telefone Celular: ${data.tel_celular}</p>
          <p>Endereço: ${data.endereco}</p>
        `;
        userDiv.classList.remove("hidden");
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar usuário:", error);
      alert("Falha ao buscar usuário.");
    });
}


function listarUsuarios() {
  fetch("/api/listar_usuarios")
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // Isso ajudará a ver o que está sendo recebido.
      const usuariosDiv = document.getElementById("usuarios");
      usuariosDiv.innerHTML = ""; // Limpar lista atual

      if (Array.isArray(data)) {
        data.forEach((usuario) => {
          const usuarioDiv = document.createElement("div");
          usuarioDiv.innerHTML = `
                    <p>ID: ${usuario.ID_USER}</p>
                    <p><strong>Nome:</strong> ${usuario.NOME}</p>
                    <p><strong>Data de Nascimento:</strong> ${usuario.DATA}</p>
                    <p><strong>Gênero:</strong> ${usuario.GENERO}</p>
                    <p><strong>Email:</strong> ${usuario.EMAIL}</p>
                    <p><strong>Telefone Residencial:</strong> ${usuario.TEL_RESIDENCIAL}</p>
                    <p><strong>Telefone Celular:</strong> ${usuario.TEL_CELULAR}</p>
                    <p><strong>Endereço:</strong> ${usuario.ENDERECO}</p>
                    <hr>
                `;
          usuariosDiv.appendChild(usuarioDiv);
        });
      } else {
        usuariosDiv.innerHTML =
          "<p>Nenhum usuário encontrado ou erro na requisição.</p>";
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar usuários:", error);
      alert("Falha ao buscar usuários.");
    });
}

function deletarUsuario() {
  const userId = document.getElementById("deleteUserId").value;
  fetch(`/api/deletar/${userId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.mensagem) {
        alert(data.mensagem);
        document.getElementById("deleteResult").classList.add("hidden"); // Esconde os resultados após deletar
      } else {
        alert(data.erro);
      }
    })
    .catch((error) => {
      console.error("Erro ao deletar o usuário:", error);
      alert("Falha ao deletar o usuário.");
    });
}

function alterarUsuario() {
  const userId = document.getElementById("updateUserId").value;
  const data = {
    nome: document.getElementById("updateNome").value,
    genero: document.getElementById("updateGenero").value,
    data: document.getElementById("updateData").value,
    email: document.getElementById("updateEmail").value,
    tel_residencial: document.getElementById("updateTelRes").value,
    tel_celular: document.getElementById("updateTelCel").value,
    endereco: document.getElementById("updateEndereco").value,
  };

  fetch(`/api/alterar/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Dados atualizados com sucesso!");
      console.log(data);
    })
    .catch((error) => {
      console.error("Erro ao atualizar dados:", error);
      alert("Falha ao atualizar dados.");
    });
}

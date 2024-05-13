// Define a função para obter dados baseados em gênero e termo de busca e exibi-los na página.
function obterDados() {
  const genero = document.getElementById("generoSelect").value;
  const busca = document.getElementById("busca").value;

  // Realiza uma requisição para a API com os parâmetros de busca e gênero.
  fetch(`/api/externo?genero=${genero}&busca=${busca}`)
    .then((response) => response.json())
    .then((dados) => {
      const resultadosDiv = document.getElementById("resultados");
      resultadosDiv.innerHTML = ""; // Limpa resultados anteriores.
      dados.forEach((dado, index) => {
        const pessoaDiv = document.createElement("div");
        pessoaDiv.className = "user-entry";
        pessoaDiv.innerHTML = `
        <div class="user-entry__image">
          <input type="checkbox" class="user-select" data-user='${JSON.stringify(
            dado
          )}'>
          <img src="${dado.imagem}" class="img-user" alt="Foto de ${
          dado.nome
        }" class="user-image">
          <p><strong>Nome:</strong><br> ${dado.nome}</p>
          <p><strong>Data de Nascimento:</strong><br> ${dado.data}</p>
          <p><strong>Gênero:</strong><br> ${dado.genero}</p>
          <p><strong>Email:</strong><br> ${dado.email}</p>
          <p><strong>Telefone:</strong><br> ${dado.tel_residencial}</p>
          <p><strong>Celular:</strong><br> ${dado.tel_celular}</p>
          <p><strong>Endereço:</strong><br> ${dado.endereco}</p>
        </div>
        `;
        resultadosDiv.appendChild(pessoaDiv);
      });
      document.getElementById("resultados").classList.remove("hidden"); // Exibe os resultados.
      document.getElementById("salvarBtn").disabled = false;
    })
    .catch((error) => {
      console.error("Erro ao buscar dados:", error);
      alert("Falha ao buscar dados.");
    });
}

// Define a função para salvar os dados selecionados pelo usuário.
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

// Função para mostrar uma seção específica, escondendo outras.
function showSection(sectionId) {
  document
    .querySelectorAll(".content-section")
    .forEach((section) => section.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");
}

// Função para consultar dados de um usuário específico e exibir na página.
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
          <div class="user-entry-consulta">
          <h2><strong>Id:</strong> ${data.id}</h2>
          <p><strong>Nome:</strong> ${data.nome}</p>
          <p><strong>Data de Nascimento:</strong> ${data.data}</p>
          <p><strong>Gênero:</strong> ${data.genero}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Telefone Residencial:</strong> ${data.tel_residencial}</p>
          <p><strong>Telefone Celular:</strong> ${data.tel_celular}</p>
          <p><strong>Endereço:</strong> ${data.endereco}</p>
          </div>
        `;
        userDiv.classList.remove("hidden");
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar usuário:", error);
      alert("Falha ao buscar usuário.");
    });
}

// A função 'listarUsuarios' é usada para obter e exibir uma lista de todos os usuários.
function listarUsuarios() {
  fetch("/api/listar_usuarios")
    .then((response) => response.json())
    .then((data) => {
      const usuariosDiv = document.getElementById("usuarios");
      usuariosDiv.innerHTML = ""; // Limpar lista atual

      if (Array.isArray(data)) {
        data.forEach((usuario) => {
          const usuarioDiv = document.createElement("div");
          usuarioDiv.innerHTML = `
          <div class="user-entry-lista">  
                    <p><strong>ID:</strong> ${usuario.ID_USER}</p>
                    <p><strong>Nome:</strong> ${usuario.NOME}</p>
                    <p><strong>Data de Nascimento:</strong> ${usuario.DATA}</p>
                    <p><strong>Gênero:</strong> ${usuario.GENERO}</p>
                    <p><strong>Email:</strong> ${usuario.EMAIL}</p>
                    <p><strong>Telefone Residencial:</strong> ${usuario.TEL_RESIDENCIAL}</p>
                    <p><strong>Telefone Celular:</strong> ${usuario.TEL_CELULAR}</p>
                    <p><strong>Endereço:</strong> ${usuario.ENDERECO}</p> <br>
                    <hr>
                    </div>
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

// Define a função para deletar um usuário específico.
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

// Função para verificar a existência de um usuário antes de tentar atualizá-lo.
function alterarUsuario() {
  const userId = document.getElementById("updateUserId").value;

  // Primeiro verifica se o usuário existe
  fetch(`/api/consultar/${userId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.erro) {
        alert("Usuário não encontrado.");
        throw new Error("Usuário não encontrado."); // Interrompe a execução
      } else {
        return atualizarDadosUsuario(userId); // Prossiga com a atualização se o usuário existir
      }
    })
    .catch((error) => {
      console.error("Erro ao verificar o usuário:", error);
    });
}

// Função para atualizar os dados de um usuário, após sua verificação.
function atualizarDadosUsuario(userId) {
  const telefoneCel = document.getElementById("updateTelCel").value;
  const telefoneRes = document.getElementById("updateTelRes").value;

  // Limpeza dos telefones antes de validar e enviar
  const telefoneCelLimpo = telefoneCel.replace(/[^\d]/g, "");
  const telefoneResLimpo = telefoneRes.replace(/[^\d]/g, "");

  if (!validarTelefone(telefoneCelLimpo) || !validarTelefone(telefoneResLimpo)) {
    alert("Por favor, insira um número de telefone válido.");
    return false; // Interrompe a função se o telefone não for válido
  }

  const data = {
    nome: document.getElementById("updateNome").value,
    genero: document.getElementById("updateGenero").value,
    data: document.getElementById("updateData").value,
    email: document.getElementById("updateEmail").value,
    tel_residencial: telefoneResLimpo,
    tel_celular: telefoneCelLimpo,
    endereco: document.getElementById("updateEndereco").value,
  };

  fetch(`/api/alterar/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Dados atualizados com sucesso!");
      console.log(data);
      listarUsuarios(); // Chama a função listarUsuarios para atualizar a lista na página
    })
    .catch((error) => {
      console.error("Erro ao atualizar dados:", error);
      alert("Falha ao atualizar dados.");
    });
}


// Função para consultar um usuário específico pelo ID e exibir seus detalhes.
function consultarUsuarioEspecifico() {
  const userId = document.getElementById("userIdConsulta").value;
  fetch(`/api/consultar/${userId}`)
    .then((response) => response.json())
    .then((usuario) => {
      const usuarioDiv = document.getElementById("usuarioEspecifico");
      if (usuario.erro) {
        alert(usuario.erro);
        usuarioDiv.classList.add("hidden");
      } else {
        usuarioDiv.innerHTML = `
                <p><strong>Nome:</strong> ${usuario.NOME}</p>
                <p><strong>Data de Nascimento:</strong> ${usuario.DATA}</p>
                <p><strong>Gênero:</strong> ${usuario.GENERO}</p>
                <p><strong>Email:</strong> ${usuario.EMAIL}</p>
                <p><strong>Telefone Residencial:</strong> ${usuario.TEL_RESIDENCIAL}</p>
                <p><strong>Telefone Celular:</strong> ${usuario.TEL_CELULAR}</p>
                <p><strong>Endereço:</strong> ${usuario.ENDERECO}</p>
            `;
        usuarioDiv.classList.remove("hidden");
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar usuário:", error);
      alert("Falha ao buscar usuário.");
    });
}

// Adiciona um evento para carregar a data máxima possível ao abrir a página.
document.addEventListener("DOMContentLoaded", function () {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("updateData").max = today;
});

// Função para validar um número de telefone.
function validarTelefone(telefone) {
  // Limpa o telefone removendo parênteses, espaços, hífens e outros caracteres não numéricos.
  const telefoneLimpo = telefone.replace(/[^\d]/g, "");

  // Verifica se tem 10 ou 11 dígitos
  const regexTelefone = /^\d{10,11}$/;
  return regexTelefone.test(telefoneLimpo);
}

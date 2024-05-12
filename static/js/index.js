function obterDados() {
  const genero = document.getElementById("generoSelect").value;
  const busca = document.getElementById("busca").value;

  fetch(`/api/externo?genero=${genero}&busca=${busca}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Falha ao buscar dados.");
      }
      return response.json();
    })
    .then((dados) => {
      console.log(dados); // Confira os dados recebidos aqui
      const resultadosDiv = document.getElementById("resultados");
      resultadosDiv.innerHTML = ""; // Limpar resultados anteriores
      dados.forEach((dado, index) => {
        const pessoaDiv = document.createElement("div");
        pessoaDiv.className = "user-entry";
        pessoaDiv.innerHTML = `
          <input type="checkbox" class="user-select" value="${index}" data-user='${JSON.stringify(
          dado
        )}'>
          <p>Nome: ${dado.nome_completo}</p>
          <p>Data de Nascimento: ${dado.data}</p>
          <p>Gênero: ${dado.genero}</p>
          <p>Email: ${dado.email}</p>
          <p>Telefone: ${dado.tel_residencial}</p>
          <p>Celular: ${dado.tel_celular}</p>
          <p>Endereço: ${dado.endereco}</p>
          <img src="${dado.imagem}" alt="Foto de ${
          dado.nome_completo
        }" class="user-image">
        `;
        resultadosDiv.appendChild(pessoaDiv);
      });
      resultadosDiv.classList.remove("hidden"); // Certifique-se de remover a classe 'hidden' para mostrar os resultados
    })
    .catch((error) => {
      console.error("Erro ao buscar dados:", error);
      alert(error.message);
    });
}

function salvarDados() {
  const checkboxes = document.querySelectorAll(".user-select:checked");
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

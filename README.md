
# Consumo de API com Python

## Objetivo
O objetivo deste projeto é criar uma aplicação em Python que consuma informações da Random User API, uma API pública que gera dados de usuários aleatórios, e armazene esses dados em uma base de dados Oracle. A interface do usuário foi desenvolvida utilizando HTML, CSS e JavaScript, e inclui validações tanto no frontend quanto no backend para garantir a integridade dos dados.

## API Utilizada
A API utilizada é a [Random User API](https://randomuser.me/documentation), que fornece dados gerados aleatoriamente de usuários.

## Funcionalidades
- **Setup inicial**: Criação automática da estrutura do banco de dados na primeira execução do script.
- **CRUD**: Permite inserção dos dados consumidos da API no banco de dados Oracle. Os usuários podem consultar, alterar e excluir registros.
- **Filtros de consulta**: Os usuários podem especificar o gênero (masculino, feminino ou ambos) e a quantidade de registros para extração da API, limitado a um máximo de 100 registros por consulta.

## Configuração e Execução
### Pré-requisitos
Para executar este projeto, é necessário ter Python instalado, assim como acesso a uma instância do OracleDB. As seguintes bibliotecas Python também precisam ser instaladas:

    pip install flask
    pip install oracledb
    pip install requests



### Arquivos do Projeto

- `main.py`: Script principal do projeto, responsável por inicializar o servidor Flask e gerenciar as rotas da aplicação.
- `secret.json`: Template vazio para armazenamento das credenciais de acesso ao banco de dados Oracle. Este arquivo deve ser preenchido com as credenciais de usuário, senha e DSN.
- `readme.md`: Arquivo de documentação do projeto que fornece uma visão geral e instruções para configuração e execução.
- `index.html`: Arquivo HTML que serve como a página principal da interface do usuário. Contém a estrutura básica da página, formulários de entrada de dados e links para estilos e scripts.
- `style.css`: Arquivo de estilos CSS que define a aparência visual da aplicação, incluindo cores, fontes e layout dos elementos da interface.
- `index.js`: Script JavaScript que contém a lógica de interação do usuário, manipulação de eventos e comunicação com o servidor para enviar e receber dados.


### Execução do Projeto

Execute o seguinte comando no terminal para iniciar o projeto:

`python main.py` 

Após a execução, o servidor Flask estará acessível pelo navegador no endereço `http://localhost:5000`

## Estrutura do Banco de Dados

Na primeira execução, o banco de dados é criado automaticamente com a seguinte estrutura:

`CREATE TABLE T_USER (
    id_user NUMBER GENERATED ALWAYS as IDENTITY(START with 1 INCREMENT by 1) PRIMARY KEY,
    nome VARCHAR2(100),
    genero VARCHAR2(50),
    data DATE,
    endereco VARCHAR2(150),
    email VARCHAR2(60),
    tel_residencial NUMBER(20),
    tel_celular NUMBER(20)
)` 

## Dados Coletados

Os dados coletados incluem:

-   Nome completo
-   Gênero (M ou F)
-   Data de nascimento (formato YYYY-MM-DD)
-   Endereço (rua e número)
-   E-mail
-   Telefone residencial (apenas números)
-   Telefone celular (apenas números, incluindo o dígito '9' adicional)
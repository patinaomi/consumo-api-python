import json
import oracledb
import requests
from flask import Flask, request, jsonify, render_template


def validar_telefone(telefone, cel=True):
    # Remove caracteres não numéricos da string telefone usando a função filter e str.isdigit
    # e depois o join junta os caracteres restantes de volta em uma string única.

    telefone_limpo = ''.join(filter(str.isdigit, telefone))

    if cel:
        return telefone_limpo[:2] + '9' + telefone_limpo[2:]
    else:
        return telefone_limpo


def carregar_dados(dados):
    try:
        with open(dados, 'r') as arquivo:
            dados = json.load(arquivo)
            return dados
    except FileNotFoundError:
        print(f'O arquivo {dados} não foi encontrado.')
        return
    except Exception as e:
        print(f'Erro: {e}')
        return


secret = carregar_dados('secret.json')


def operacao_db(comando, secret, commit=True):
    try:
        with oracledb.connect(user=secret['user'],
                              password=secret['password'],
                              dsn=secret['dsn']) as connection:
            with connection.cursor() as cursor:
                cursor.execute(comando)

                if commit:
                    connection.commit()

    except oracledb.DatabaseError as e:
        print(f'Erro no banco de dados: {e}')
    except Exception as e:
        print(f'Erro: {e}')


def consulta_db(comando, secret):
    try:
        with oracledb.connect(user=secret['user'],
                              password=secret['password'],
                              dsn=secret['dsn']) as connection:
            with connection.cursor() as cursor:
                cursor.execute(comando)
                data = cursor.fetchall()
                columns = [col[0] for col in cursor.description]  # Obtém os nomes das colunas
                return data, columns
    except oracledb.DatabaseError as e:
        print(f'Erro no banco de dados: {e}')
        return None, None
    except Exception as e:
        print(f'Erro: {e}')
        return None, None



sql_drop_tabela = 'DROP TABLE T_USER CASCADE CONSTRAINTS'
sql_criar_tabela = """ 
    CREATE TABLE T_USER (
    id_user NUMBER GENERATED ALWAYS as IDENTITY(START with 1 INCREMENT by 1) PRIMARY KEY,
    nome VARCHAR2(100),
    genero VARCHAR2(50),
    data DATE,
    endereco VARCHAR2(150),
    email VARCHAR2(60),
    tel_residencial NUMBER(20),
    tel_celular NUMBER(20)
)"""


def obter_dados_api(qtd_busca, genero):
    gender_param = '' if genero == 'both' else f'&gender={genero}'
    url = f'https://randomuser.me/api/?results={qtd_busca}&nat=br{gender_param}&inc=name,gender,nat,location,dob,email,phone,cell,picture&noinfo'
    response = requests.get(url)
    
    if response.status_code == 200:
        dados = response.json()['results']
        return [{
            'nome': f"{dado['name']['first']} {dado['name']['last']}",
            'genero': 'F' if dado['gender'] == 'female' else 'M',
            'data': dado['dob']['date'][:10],
            'endereco': f"{dado['location']['street']['name']} {dado['location']['street']['number']}",
            'email': dado['email'],
            'tel_residencial': validar_telefone(dado['phone'], False),
            'tel_celular': validar_telefone(dado['cell']),
            'imagem': dado['picture']['large']
        } for dado in dados]
    return None


def inserir_dados_usuario(dados_usuario, secret):
    if dados_usuario:
        sql_insert = f"""
        INSERT INTO t_user (
            nome, genero, data, endereco, email, tel_residencial, tel_celular
        ) VALUES (
            '{dados_usuario['nome']}', '{dados_usuario['genero']}', TO_DATE('{dados_usuario['data']}', 'YYYY-MM-DD'), 
            '{dados_usuario['endereco']}', '{dados_usuario['email']}', {dados_usuario['tel_residencial']}, {dados_usuario['tel_celular']}
        )"""
        operacao_db(sql_insert, secret)
        return True
    return False


# Parte do Flask
app = Flask(__name__, template_folder='.')

@app.route('/')
def home():
    return render_template('/templates/index.html')

@app.route('/api/externo')
def obter_dados():
    qtd_busca = request.args.get('busca', default=1, type=int)
    genero = request.args.get('genero', default='both', type=str)
    dados = obter_dados_api(qtd_busca, genero)
    if dados:
        return jsonify(dados), 200
    else:
        return jsonify({'erro': 'Falha ao obter dados da API'}), 400


@app.route('/api/salvar', methods=['POST'])
def salvar_dados():
    dados = request.get_json()  # Obter os dados JSON enviados pelo cliente
    if not dados:
        return jsonify({'erro': 'Nenhum dado para salvar'}), 400

    resultados = []
    for dado in dados:
        sucesso = inserir_dados_usuario(dado, secret)
        resultados.append({'nome': dado['nome'], 'status': 'sucesso' if sucesso else 'falha'})

    return jsonify(resultados), 200


@app.route('/api/deletar/<int:user_id>', methods=['DELETE'])
def deletar_usuario(user_id):
    if user_id:
        comando = f"DELETE FROM t_user WHERE id_user = {user_id}"
        try:
            operacao_db(comando, secret)
            return jsonify({'mensagem': 'Usuário deletado com sucesso!'}), 200
        except Exception as e:
            return jsonify({'erro': str(e)}), 500
    return jsonify({'erro': 'ID não fornecido.'}), 400


if __name__ == '__main__':
    app.run(debug=True)
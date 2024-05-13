import json
import oracledb
import requests
import re
from flask import Flask, request, jsonify, render_template


def validar_telefone(telefone, cel=True):
    # Remove caracteres não numéricos da string telefone usando a função filter e str.isdigit
    # e depois o join junta os caracteres restantes de volta em uma string única.
    telefone_limpo = ''.join(filter(str.isdigit, telefone))

    if cel:
        return telefone_limpo[:2] + '9' + telefone_limpo[2:]
    else:
        return telefone_limpo


def validar_email(email):
    regex_email = r'^[\w\.-]+@[\w\.-]+\.\w+'

    if re.match(regex_email, email):
        return True
    else:
        return False


def validar_nome(nome):
    regex_nome = r'^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$'
    if re.match(regex_nome, nome):
        return True
    else:
        return False


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

# Operações de banco de dados
def operacao_db(comando, secret, commit=True):
    try:
        with oracledb.connect(user=secret['user'],
                              password=secret['password'],
                              dsn=secret['dsn']) as connection:
            with connection.cursor() as cursor:
                cursor.execute(comando)
                if commit:
                    connection.commit()
                return cursor.rowcount  # Retorna o número de linhas afetadas
    except oracledb.DatabaseError as e:
        print(f'Erro no banco de dados: {e}')
        return None  # Retorna None em caso de erro
    except Exception as e:
        print(f'Erro: {e}')
        return None


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

# API para obtenção de dados externos
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



@app.route('/api/consultar/<int:user_id>', methods=['GET'])
def consultar_usuario(user_id):
    try:
        comando = f"SELECT * FROM t_user WHERE id_user = {user_id}"
        dados_usuario, columns = consulta_db(comando, secret)
        if dados_usuario:
            usuario = dict(zip(columns, dados_usuario[0]))
            usuario['DATA'] = usuario['DATA'].strftime('%Y-%m-%d') if usuario.get('DATA') else 'N/A'
            return jsonify(usuario), 200
        else:
            return jsonify({'erro': 'Usuário não encontrado.'}), 404
    except Exception as e:
        return jsonify({'erro': str(e)}), 500



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
        # Primeiro verifica se o usuário existe
        comando_verificacao = f"SELECT * FROM t_user WHERE id_user = {user_id}"
        dados_usuario, _ = consulta_db(comando_verificacao, secret)
        if not dados_usuario:
            return jsonify({'erro': 'Usuário não encontrado.'}), 404
        
        # Se existir, procede com a deleção
        comando_deletar = f"DELETE FROM t_user WHERE id_user = {user_id}"
        try:
            operacao_db(comando_deletar, secret, commit=True)
            return jsonify({'mensagem': 'Usuário deletado com sucesso!'}), 200
        except Exception as e:
            return jsonify({'erro': str(e)}), 500

    return jsonify({'erro': 'ID não fornecido.'}), 400



@app.route('/api/listar_usuarios', methods=['GET'])
def listar_usuarios():
    try:
        comando = "SELECT * FROM t_user"
        dados_usuario, columns = consulta_db(comando, secret)
        if dados_usuario:
            usuarios = [dict(zip(columns, usuario)) for usuario in dados_usuario]
            for usuario in usuarios:
                usuario['data'] = usuario['data'].strftime('%Y-%m-%d') if usuario.get('data') else 'N/A'  # Formatar data
            return jsonify(usuarios), 200
        else:
            return jsonify({'erro': 'Nenhum usuário encontrado.'}), 404
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/alterar/<int:user_id>', methods=['PUT'])
def alterar_usuario(user_id):
    dados = request.get_json()
    if not dados or not all(key in dados for key in ['nome', 'genero', 'data', 'email', 'tel_residencial', 'tel_celular', 'endereco']):
        return jsonify({'erro': 'Dados incompletos fornecidos'}), 400
    print(f"Recebendo dados para atualizar: {dados}")  # Log dos dados recebidos
    if not dados:
        return jsonify({'erro': 'Nenhum dado fornecido para atualização'}), 400

    comando_verificacao = f"SELECT * FROM t_user WHERE id_user = {user_id}"
    dados_usuario, _ = consulta_db(comando_verificacao, secret)
    if not dados_usuario:
        return jsonify({'erro': 'Usuário não encontrado.'}), 404

    try:
        comando = f"""
        UPDATE t_user SET
        nome = '{dados['nome']}',
        genero = '{dados['genero']}',
        data = TO_DATE('{dados['data']}', 'YYYY-MM-DD'),
        email = '{dados['email']}',
        tel_residencial = {dados['tel_residencial']},
        tel_celular = {dados['tel_celular']},
        endereco = '{dados['endereco']}'
        WHERE id_user = {user_id}
        """
        rows_affected = operacao_db(comando, secret, commit=True)
        if rows_affected > 0:
            print(f"Linhas atualizadas: {rows_affected}")  # Log do sucesso
            return jsonify({'mensagem': 'Dados atualizados com sucesso!'}), 200
        else:
            print("Nenhuma linha atualizada.")  # Log de falha
            return jsonify({'erro': 'Nenhuma alteração realizada.'}), 200
    except Exception as e:
        print(f'Erro ao atualizar dados: {e}')  # Log de exceção
        return jsonify({'erro': str(e)}), 500
 
if __name__ == '__main__':
    app.run(debug=True)
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
                return cursor.fetchall()

    except oracledb.DatabaseError as e:
        print(f'Erro no banco de dados: {e}')
    except Exception as e:
        print(f'Erro: {e}')


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

# operacao_db(sql_drop_tabela, secret)
# operacao_db(sql_criar_tabela, secret)


qtd_busca = 1
genero = 'female'

url = (f'https://randomuser.me/api/?results={qtd_busca}&nat=br,&gender={genero},&inc=name,gender,nat,location,dob,'
       f'email,phone,cell&noinfo')

response = requests.get(url)

# Dados obtidos na consulta inicial

dict_pessoa = response.json()  # Converte a resposta em JSON para um dicionário Python


# Deserializar o JSON para um objeto Python

# Preparando os dados para o banco
nome_completo = dict_pessoa['results'][0]['name']['first'] + ' ' + dict_pessoa['results'][0]['name']['last']
genero = 'F' if dict_pessoa['results'][0]['gender'] == 'female' else 'M'
data = dict_pessoa['results'][0]['dob']['date'][:10]  # Pra pegar só a data certinho
endereco = dict_pessoa['results'][0]['location']['street']['name'] + ' ' + str(dict_pessoa['results'][0]['location']['street']['number'])
email = dict_pessoa['results'][0]['email']
tel_residencial = validar_telefone(dict_pessoa['results'][0]['phone'], False)
tel_celular = validar_telefone(dict_pessoa['results'][0]['cell'])

sql_insert = f"""INSERT INTO t_user (nome, genero, data, endereco, email, tel_residencial, tel_celular) VALUES ('{
nome_completo}', '{genero}',  TO_DATE('{data}','YYYY-MM-DD'), '{endereco}', '{email}', {tel_residencial},
{tel_celular})"""

operacao_db(sql_insert, secret)
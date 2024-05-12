import json
import oracledb
import requests
from flask import Flask, request, jsonify, render_template


def carregar_dados(dados):
    try:
        with open(dados, 'r') as arquivo:
            dados = json.load(arquivo)
            return dados
    except FileNotFoundError:
        print(f'O arquivo {dados} não foi encontrado.')
        return


secret = carregar_dados('secret.json')
usuario = secret['user']  # Usuário
senha = secret['password']  # Senha
oracle = secret['dsn']  # Servidor


def executar_sql(usuario, senha, oracle, sql):
    try:
        with oracledb.connect(user=usuario, password=senha, dsn=oracle) as connection:
            cursor = connection.cursor()
            cursor.execute(sql)

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

# Criando as tabelas
executar_sql(usuario, senha, oracle, sql_drop_tabela)
executar_sql(usuario, senha, oracle, sql_criar_tabela)

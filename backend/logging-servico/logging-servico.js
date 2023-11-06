// Inicia o Express.js
const express = require("express");
const app = express();

// Body Parser - usado para processar dados da requisição HTTP
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Inicia o Servidor
let porta = 8080;
app.listen(porta, () => {
  console.log("Servidor em execução na porta: " + porta);
});

// Importa o package do SQLite
const sqlite3 = require("sqlite3");

// Acessa o arquivo com o banco de dados
var db = new sqlite3.Database("./dados-usuario.db", (err) => {
  if (err) {
    console.log("Erro ao tentar conectar ao SQLite!");
    throw err;
  }
  console.log("Conectado ao banco de dados de logging!");
});

// Cria a tabela 'registros', caso ela não exista
db.run(
    `CREATE TABLE IF NOT EXISTS registros (
      id INTEGER PRIMARY KEY NOT NULL UNIQUE,
      inicio TEXT DEFAULT CURRENT_TIMESTAMP,
      distancia INTEGER NOT NULL
    )`,
    [],
    (err) => {
      if (err) {
        console.error("Erro ao tentar criar tabela de registros!");
        throw err;
      }
    }
  );

// MÉTODOS CRUD HTTP
// POST /registros - INSERIR registro de leitura do sensor
app.post("/registros", (req, res) => {
  db.run(
    `INSERT INTO registros(distancia) VALUES(?)`,
    [req.body.distancia],
    (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Erro ao inserir registro de leitura!");
      } else {
        console.log(`Leitura registrada com sucesso! Distância: ${req.body.distancia}cm.`);
        res
          .status(200)
          .send(`Leitura registrada com sucesso! Distância: ${req.body.distancia}cm.`);
      }
    }
  );
});
// CONTINUAR AQUI!!!
// GET /registros - RETORNAR todos os usuários
app.get("/registros", (req, res) => {
  db.all(`SELECT * FROM registros`, [], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Erro ao obter dados de usuários!");
    } else if (result.length === 0) {
      console.log("Lista de usuários vazia!");
      res.status(500).send("Lista de usuários vazia!");
    } else {
      console.log("Lista de usuários encontrada!");
      res.status(200).json(result);
    }
  });
});

// GET /registros/:cpf - RETORNAR usuário com base no CPF
app.get("/registros/:cpf", (req, res) => {
  db.get(
    `SELECT * FROM usuario WHERE cpf = ?`,
    req.params.cpf,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Erro ao acessar lista de usuários!");
      } else if (result == null) {
        console.log(`Usuário cpf ${req.params.cpf} não encontrado!`);
        res.status(404).send(`Usuário cpf ${req.params.cpf} não encontrado!`);
      } else {
        console.log(`Usuário cpf ${req.params.cpf} encontrado!`);
        res.status(200).json(result);
      }
    }
  );
});

// PATCH /registros/:cpf - ALTERAR o cadastro de um usuário
app.patch("/registros/:cpf", (req, res) => {
  db.run(
    `UPDATE usuario 
        SET nome = COALESCE(?, nome), 
        email = COALESCE(?, email),
        telefone = COALESCE(?, telefone)
        WHERE cpf = ?`,
    [req.body.nome, req.body.email, req.body.telefone, req.params.cpf],
    function (err) {
      if (err) {
        console.error(err);
        res
          .status(500)
          .send(`Erro ao alterar dados do usuário cpf ${req.params.cpf}!`);
      } else if (this.changes == 0) {
        console.log(`Usuário cpf ${req.params.cpf} não encontrado!`);
        res.status(404).send(`Usuário cpf ${req.params.cpf} não encontrado!`);
      } else {
        console.log(`Usuário cpf ${req.params.cpf} alterado com sucesso!`);
        res
          .status(200)
          .send(`Usuário cpf ${req.params.cpf} alterado com sucesso!`);
      }
    }
  );
});

// DELETE /registros/:cpf - REMOVER um usuário do cadastro
app.delete("/registros/:cpf", (req, res) => {
  db.run(`DELETE FROM usuario WHERE cpf = ?`, req.params.cpf, function (err) {
    if (err) {
      console.error(err);
      res.status(500).send(`Erro ao remover usuário cpf ${req.params.cpf}!`);
    } else if (this.changes == 0) {
      console.log(`Usuário cpf ${req.params.cpf} não encontrado!`);
      res.status(404).send(`Usuário cpf ${req.params.cpf} não encontrado!`);
    } else {
      console.log(`Usuário cpf ${req.params.cpf} removido com sucesso!`);
      res
        .status(200)
        .send(`Usuário cpf ${req.params.cpf} removido com sucesso!`);
    }
  });
});
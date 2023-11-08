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
      data_hora TEXT DEFAULT CURRENT_TIMESTAMP,
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
        console.log(
          `Leitura registrada com sucesso! Distância: ${req.body.distancia}cm.`
        );
        res
          .status(200)
          .send(
            `Leitura registrada com sucesso! Distância: ${req.body.distancia}cm.`
          );
      }
    }
  );
});

// GET /registros - RETORNAR todos os registros de leitura do sensor
app.get("/registros", (req, res) => {
  db.all(`SELECT * FROM registros`, [], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Erro ao obter dados de registros!");
    } else if (result.length === 0) {
      console.log("Lista de registros vazia!");
      res.status(500).send("Lista de registros vazia!");
    } else {
      console.log("Lista de registros encontrada!");
      res.status(200).json(result);
    }
  });
});

// GET /registros/:data - RETORNAR todoa os registros de uma data YYYY-MM-DD
app.get("/registros/:data", (req, res) => {
  // Padrão regex para formato YYYY-MM-DD
  const regexData = /^\d{4}-\d{2}-\d{2}$/;
  const stringData = req.params.data;

  // Checa se a data na URL é um formato válido
  if (!stringData.match(regexData)) {
    res
      .status(400)
      .send(
        `${stringData} não é um formato válido de data! Favor enviar requisição no formato YYYY-MM-DD.`
      );
    console.error(
      `${stringData} não é um formato válido de data! Favor enviar requisição no formato YYYY-MM-DD.`
    );
    return;
  }
  db.all(
    `SELECT * FROM registros WHERE data_hora LIKE '?%'`,
    req.params.data,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Erro ao acessar lista de registros!");
      } else if (result == null) {
        console.log(`Nenhum registro encontrado para a data ${stringData}!`);
        res
          .status(404)
          .send(`Nenhum registro encontrado para a data ${stringData}!`);
      } else {
        console.log(`Registros da data ${stringData} encontrados!`);
        res.status(200).json(result);
      }
    }
  );
});

// DELETE /registros/:id - REMOVER um regisro pelo id
app.delete("/registros/:id", (req, res) => {
  const idRegistro = req.params.id;
  if (isNaN(idRegistro)) {
    res.status(400).send("Erro: id deve ser um número inteiro!");
    console.log("Erro: id deve ser um número inteiro!");
    return;
  }
  db.run(`DELETE FROM registros WHERE id = ?`, idRegistro, function (err) {
    if (err) {
      console.error(err);
      res.status(500).send(`Erro ao remover registro id ${idRegistro}!`);
    } else if (this.changes == 0) {
      console.log(`Registro id ${idRegistro} não encontrado!`);
      res.status(404).send(`Registro id ${idRegistro} não encontrado!`);
    } else {
      console.log(`Registro id ${idRegistro} removido com sucesso!`);
      res.status(200).send(`Registro id ${idRegistro} removido com sucesso!`);
    }
  });
});

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
var db = new sqlite3.Database("./dados-config.db", (err) => {
  if (err) {
    console.log("Erro ao tentar conectar ao SQLite!");
    throw err;
  }
  console.log("Conectado ao banco de dados de configurações!");
});

// Cria a tabela 'config' com distância inicial 50cm, caso ela já não exista
db.run(
  `CREATE TABLE IF NOT EXISTS config (distancia INTEGER NOT NULL)
   INSERT INTO config VALUES(50)`,
  [],
  (err) => {
    if (err) {
      console.log("Erro ao tentar criar tabela de configurações!");
      throw err;
    }
  }
);

// MÉTODOS HTTP
// GET /controle - Retorna o valor de distância (cm) de calibração
app.get("/controle", (req, res) => {
  db.get(`SELECT distancia FROM config`, [], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Erro ao obter dados de configuração!");
    } else if (result.length === 0) {
      console.log("Tabela de configurações vazia!");
      res.status(500).send("Tabela de configurações vazia!");
    } else {
      console.log("Tabela de configurações encontrada!");
      res.status(200).json(result);
    }
  });
});

// PATCH /controle - BLOQUEIA OU DESBLOQUEIA o patinete com base no serial
app.patch("/controle", (req, res) => {
  db.run(
    `UPDATE config 
        SET distancia = COALESCE(?, distancia)`,
    [req.body.distancia],
    function (err) {
      if (err) {
        console.error(err);
        res.status(500).send("Erro ao alterar distância!");
      } else if (this.changes == 0) {
        console.log("Configuração não foi encontrada!");
        res.status(404).send("Configuração não foi encontrada!");
      } else {
        console.log(
          `Distância de calibração do sensor alterada para ${req.body.distancia}cm!`
        );
        res
          .status(200)
          .send(
            `Distância de calibração do sensor alterada para ${req.body.distancia}cm!`
          );
      }
    }
  );
});

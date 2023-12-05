const express = require("express");
const app = express();
// const os = require("os");

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let porta = 8080;
app.listen(porta, () => {
  //const redes = os.networkInterfaces();
  //const ip = redes['Ethernet'][1].address; // Altere 'Wi-Fi' para o nome da sua interface de rede

  console.log("Servidor em execução em na porta 8080");
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
  `CREATE TABLE IF NOT EXISTS config (distancia INTEGER NOT NULL)`,
  [],
  (err) => {
    if (err) {
      console.error("Erro ao tentar criar tabela de configurações!");
      throw err;
    } else {
      // Inserir valor padrão na nova tabela
      db.run(`INSERT INTO config(distancia) VALUES(50)`, [], (err) => {
        if (err) {
          console.error(
            "Erro ao tentar inserir valor na tabela de configurações!"
          );
          throw err;
        }
      });
    }
  }
);

// MÉTODOS HTTP
// GET /config - Retorna o valor de distância (cm) de calibração
app.get("/config", (req, res) => {
  db.get(`SELECT distancia FROM config`, [], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Erro ao obter dados de configuração!");
    } else if (result.length === 0) {
      console.log("Tabela de configurações vazia!");
      res.status(500).send("Tabela de configurações vazia!");
    } else {
      console.log(`Distância de calibração: ${result.distancia}cm`);
      res.status(200).json(result);
    }
  });
});

// PATCH /config - Altera o valor de distância (cm) de calibração
app.patch("/config", (req, res) => {
  // Checar tipo e valores da distancia inserida
  const distanciaNova = parseInt(req.body.distancia);
  if (isNaN(distanciaNova)) {
    res.status(400).send("Erro: distância deve ser um número inteiro!");
    console.log("Erro: distância deve ser um número inteiro!");
    return;
  } else if (distanciaNova < 50 || distanciaNova > 150) {
    res.status(400).send("Erro: distância deve ser um número entre 50 e 150!");
    console.log("Erro: distância deve ser um número entre 50 e 150!");
    return;
  }

  // Alterar configuração na tabela
  db.run(
    `UPDATE config 
        SET distancia = COALESCE(?, distancia)`,
    [distanciaNova],
    function (err) {
      if (err) {
        console.error(err);
        res.status(500).send("Erro ao alterar distância!");
      } else if (this.changes == 0) {
        console.log("Configuração não foi encontrada!");
        res.status(404).send("Configuração não foi encontrada!");
      } else {
        console.log(
          `Distância de calibração do sensor alterada para ${distanciaNova}cm!`
        );
        res
          .status(200)
          .send(
            `Distância de calibração do sensor alterada para ${distanciaNova}cm!`
          );
      }
    }
  );
});

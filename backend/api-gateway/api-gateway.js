const httpProxy = require("express-http-proxy");
const express = require("express");
const logger = require("morgan");

const app = express();
app.use(logger("dev"));

function selectProxyHost(req) {
  if (req.path.startsWith("/config")) return "http://localhost:8080/";
  else if (req.path.startsWith("/registros")) return "http://localhost:8081/";
  else return null;
}

app.use((req, res, next) => {
  var proxyHost = selectProxyHost(req);
  if (proxyHost == null) res.status(404).send("Serviço não encontrado");
  else httpProxy(proxyHost)(req, res, next);
});

app.listen(8000, () => {
  console.log("API Gateway iniciado!");
});
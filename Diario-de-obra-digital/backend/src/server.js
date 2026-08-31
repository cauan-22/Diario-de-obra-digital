/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: server.js
   Descrição: Ponto de entrada da API. Configura o Express,
   liga as rotas e sobe o servidor.
========================================================== */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const usuariosRoutes = require("./routes/usuarios.routes");
const obrasRoutes = require("./routes/obras.routes");
const estruturaRoutes = require("./routes/estrutura.routes");
const funcionariosRoutes = require("./routes/funcionarios.routes");
const terceirizadosRoutes = require("./routes/terceirizados.routes");
const equipamentosRoutes = require("./routes/equipamentos.routes");

const app = express();

app.use(cors());
app.use(express.json());

/* Rota simples pra verificar se a API está no ar */

app.get("/", (req, res) => {
    res.json({ status: "ok", message: "API do BuildTrack no ar." });
});

app.use("/usuarios", usuariosRoutes);
app.use("/obras", obrasRoutes);
app.use("/", estruturaRoutes);
app.use("/", funcionariosRoutes);
app.use("/", terceirizadosRoutes);
app.use("/", equipamentosRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: terceirizados.routes.js
========================================================== */

const express = require("express");
const router = express.Router();

const terceirizadosController = require("../controllers/terceirizados.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/obras/:obraId/empresas", terceirizadosController.listar);

router.post("/obras/:obraId/empresas", authMiddleware, terceirizadosController.criarEmpresa);
router.put("/empresas/:id", authMiddleware, terceirizadosController.atualizarEmpresa);
router.delete("/empresas/:id", authMiddleware, terceirizadosController.excluirEmpresa);

router.post("/empresas/:empresaId/funcionarios", authMiddleware, terceirizadosController.criarFuncionario);
router.put("/funcionarios-terceirizados/:id", authMiddleware, terceirizadosController.atualizarFuncionario);
router.delete("/funcionarios-terceirizados/:id", authMiddleware, terceirizadosController.excluirFuncionario);

module.exports = router;

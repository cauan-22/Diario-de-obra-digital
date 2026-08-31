/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: funcionarios.routes.js
========================================================== */

const express = require("express");
const router = express.Router();

const funcionariosController = require("../controllers/funcionarios.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/obras/:obraId/funcionarios", funcionariosController.listar);
router.post("/obras/:obraId/funcionarios", authMiddleware, funcionariosController.criar);
router.put("/funcionarios/:id", authMiddleware, funcionariosController.atualizar);
router.delete("/funcionarios/:id", authMiddleware, funcionariosController.excluir);

module.exports = router;

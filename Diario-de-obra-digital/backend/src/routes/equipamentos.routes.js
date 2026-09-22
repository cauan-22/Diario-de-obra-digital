/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: equipamentos.routes.js
========================================================== */

const express = require("express");
const router = express.Router();

const equipamentosController = require("../controllers/equipamentos.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/obras/:obraId/equipamentos", authMiddleware, equipamentosController.listar);
router.post("/obras/:obraId/equipamentos", authMiddleware, equipamentosController.criar);
router.put("/equipamentos/:id", authMiddleware, equipamentosController.atualizar);
router.delete("/equipamentos/:id", authMiddleware, equipamentosController.excluir);

module.exports = router;

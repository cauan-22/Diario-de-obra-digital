/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: rdos.routes.js
========================================================== */

const express = require("express");
const router = express.Router();

const rdosController = require("../controllers/rdos.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/obras/:obraId/rdos", authMiddleware, rdosController.listar);
router.get("/obras/:obraId/rdos/next-number", authMiddleware, rdosController.getNextRdoNumber);

// Antes, essas duas não exigiam login — qualquer um com o ID do
// RDO via os detalhes ou baixava o PDF. Agora exigem login, e o
// controller confere se o RDO é de uma obra do usuário logado.
router.get("/rdos/:id", authMiddleware, rdosController.buscarPorId);
router.get("/rdos/:id/pdf", authMiddleware, rdosController.gerarPDF);

router.post("/obras/:obraId/rdos", authMiddleware, rdosController.criar);
router.put("/rdos/:id", authMiddleware, rdosController.atualizar);

module.exports = router;

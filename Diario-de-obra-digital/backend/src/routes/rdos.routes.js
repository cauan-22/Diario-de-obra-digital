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

// A busca por um RDO específico e o PDF continuam sem exigir
// dono específico por enquanto — isso é reforçado quando a
// tela de Novo RDO/Editar RDO for ligada ao backend de verdade.
router.get("/rdos/:id", rdosController.buscarPorId);
router.get("/rdos/:id/pdf", rdosController.gerarPDF);

router.post("/obras/:obraId/rdos", authMiddleware, rdosController.criar);
router.put("/rdos/:id", authMiddleware, rdosController.atualizar);

module.exports = router;

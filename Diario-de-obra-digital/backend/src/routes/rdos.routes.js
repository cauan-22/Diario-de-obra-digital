/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: rdos.routes.js
========================================================== */

const express = require("express");
const router = express.Router();

const rdosController = require("../controllers/rdos.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/obras/:obraId/rdos", rdosController.listar);
router.get("/obras/:obraId/rdos/next-number", rdosController.getNextRdoNumber);

router.get("/rdos/:id", rdosController.buscarPorId);
router.get("/rdos/:id/pdf", rdosController.gerarPDF);

router.post("/obras/:obraId/rdos", authMiddleware, rdosController.criar);
router.put("/rdos/:id", authMiddleware, rdosController.atualizar);

module.exports = router;

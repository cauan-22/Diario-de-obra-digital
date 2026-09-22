/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: obras.routes.js
========================================================== */

const express = require("express");
const router = express.Router();

const obrasController = require("../controllers/obras.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const checkObraOwnership = require("../middlewares/checkObraOwnership.middleware");

// Antes: GET não exigia login nenhum — qualquer um (ou qualquer
// obra de qualquer usuário) podia ser consultado. Agora todas as
// rotas exigem login, e as que apontam pra uma obra específica
// checam se ela realmente pertence a quem está logado.

router.get("/", authMiddleware, obrasController.listar);
router.get("/:id", authMiddleware, checkObraOwnership, obrasController.buscarPorId);
router.post("/", authMiddleware, obrasController.criar);
router.put("/:id", authMiddleware, checkObraOwnership, obrasController.atualizar);

module.exports = router;

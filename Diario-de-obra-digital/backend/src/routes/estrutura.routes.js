/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: estrutura.routes.js
========================================================== */

const express = require("express");
const router = express.Router();

const estruturaController = require("../controllers/estrutura.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/obras/:obraId/estrutura", estruturaController.listarEstrutura);

router.post("/obras/:obraId/etapas", authMiddleware, estruturaController.criarEtapa);
router.put("/etapas/:id", authMiddleware, estruturaController.atualizarEtapa);
router.delete("/etapas/:id", authMiddleware, estruturaController.excluirEtapa);

router.post("/etapas/:etapaId/subetapas", authMiddleware, estruturaController.criarSubetapa);
router.put("/subetapas/:id", authMiddleware, estruturaController.atualizarSubetapa);
router.delete("/subetapas/:id", authMiddleware, estruturaController.excluirSubetapa);

router.post("/subetapas/:subetapaId/atividades", authMiddleware, estruturaController.criarAtividade);
router.put("/atividades/:id", authMiddleware, estruturaController.atualizarAtividade);
router.delete("/atividades/:id", authMiddleware, estruturaController.excluirAtividade);

module.exports = router;

/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: obras.routes.js
========================================================== */

const express = require("express");
const router = express.Router();

const obrasController = require("../controllers/obras.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", obrasController.listar);
router.get("/:id", obrasController.buscarPorId);
router.post("/", authMiddleware, obrasController.criar);
router.put("/:id", authMiddleware, obrasController.atualizar);

module.exports = router;

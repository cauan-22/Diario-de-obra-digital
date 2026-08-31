/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: usuarios.routes.js
========================================================== */

const express = require("express");
const router = express.Router();

const usuariosController = require("../controllers/usuarios.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/cadastro", usuariosController.cadastrar);
router.post("/login", usuariosController.login);
router.get("/perfil", authMiddleware, usuariosController.getPerfil);

module.exports = router;

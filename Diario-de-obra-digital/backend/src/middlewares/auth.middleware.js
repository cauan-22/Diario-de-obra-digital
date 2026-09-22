/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: auth.middleware.js
   Descrição: Verifica se a requisição tem um token válido
   antes de deixar passar pra rota. Usado em ações que exigem
   estar logado (ex: criar uma obra).

   O front deve enviar o token assim:
   Authorization: Bearer <token>
========================================================== */

const jwt = require("jsonwebtoken");
require("dotenv").config();

function authMiddleware(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token não informado." });
    }

    const token = authHeader.replace("Bearer ", "");

    try {

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = payload.userId;

        next();

    } catch (error) {
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }

}

module.exports = authMiddleware;

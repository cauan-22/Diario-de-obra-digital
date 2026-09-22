/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: checkObraOwnership.middleware.js
   Descrição: Bloqueia o acesso quando a obra da URL
   (:obraId ou :id) não pertence ao usuário logado.

   Precisa rodar DEPOIS do authMiddleware (que preenche
   req.userId).
========================================================== */

const { obraPertenceAoUsuario } = require("../utils/obraOwnership");

async function checkObraOwnership(req, res, next) {

    const obraId = req.params.obraId || req.params.id;

    try {

        const pertence = await obraPertenceAoUsuario(obraId, req.userId);

        if (!pertence) {
            // 404 (e não 403) de propósito — assim quem tenta "adivinhar"
            // IDs de obras de outras pessoas nem sabe se o ID existe.
            return res.status(404).json({ error: "Obra não encontrada." });
        }

        next();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao verificar permissão sobre a obra." });
    }

}

module.exports = checkObraOwnership;

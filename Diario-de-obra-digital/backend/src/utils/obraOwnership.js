/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: obraOwnership.js
   Descrição: Funções auxiliares para descobrir a qual obra
   (e a qual dono) um registro pertence, subindo a "árvore"
   quando necessário (ex: uma atividade pertence a uma
   subetapa, que pertence a uma etapa, que pertence a uma obra).

   Isso existe pra garantir que um usuário NUNCA veja ou edite
   dados de uma obra que não é dele — mesmo sabendo o ID de
   algo (um funcionário, uma etapa, etc).
========================================================== */

const pool = require("../db");

async function getObraIdDaEtapa(etapaId) {
    const result = await pool.query("SELECT obra_id FROM etapas WHERE id = $1", [etapaId]);
    return result.rows[0]?.obra_id ?? null;
}

async function getObraIdDaSubetapa(subetapaId) {
    const result = await pool.query(
        `SELECT etapas.obra_id
         FROM subetapas
         JOIN etapas ON etapas.id = subetapas.etapa_id
         WHERE subetapas.id = $1`,
        [subetapaId]
    );
    return result.rows[0]?.obra_id ?? null;
}

async function getObraIdDaAtividade(atividadeId) {
    const result = await pool.query(
        `SELECT etapas.obra_id
         FROM atividades_catalogo
         JOIN subetapas ON subetapas.id = atividades_catalogo.subetapa_id
         JOIN etapas ON etapas.id = subetapas.etapa_id
         WHERE atividades_catalogo.id = $1`,
        [atividadeId]
    );
    return result.rows[0]?.obra_id ?? null;
}

async function getObraIdDoFuncionarioTerceirizado(funcionarioId) {
    const result = await pool.query(
        `SELECT empresas_terceirizadas.obra_id
         FROM funcionarios_terceirizados
         JOIN empresas_terceirizadas ON empresas_terceirizadas.id = funcionarios_terceirizados.empresa_id
         WHERE funcionarios_terceirizados.id = $1`,
        [funcionarioId]
    );
    return result.rows[0]?.obra_id ?? null;
}

/* Confere se a obra pertence mesmo ao usuário logado. */

async function obraPertenceAoUsuario(obraId, userId) {

    if (!obraId) return false;

    const result = await pool.query(
        "SELECT owner_user_id FROM obras WHERE id = $1",
        [obraId]
    );

    return result.rows.length > 0 && result.rows[0].owner_user_id === userId;

}

module.exports = {
    getObraIdDaEtapa,
    getObraIdDaSubetapa,
    getObraIdDaAtividade,
    getObraIdDoFuncionarioTerceirizado,
    obraPertenceAoUsuario
};

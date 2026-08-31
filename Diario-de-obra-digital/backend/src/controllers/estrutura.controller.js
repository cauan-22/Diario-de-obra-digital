/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: estrutura.controller.js
   Descrição: CRUD de Etapas, Subetapas e Atividades cadastradas
   (a "ficha técnica" da obra, separada dos RDOs do dia a dia).
========================================================== */

const pool = require("../db");

/* ==========================================================
   GET /obras/:obraId/estrutura
   Devolve a árvore inteira: etapas > subetapas > atividades.
========================================================== */

async function listarEstrutura(req, res) {

    const { obraId } = req.params;

    try {

        const etapasResult = await pool.query(
            "SELECT * FROM etapas WHERE obra_id = $1 ORDER BY order_index",
            [obraId]
        );

        const etapaIds = etapasResult.rows.map((e) => e.id);

        let subetapasRows = [];
        let atividadesRows = [];

        if (etapaIds.length > 0) {

            const subetapasResult = await pool.query(
                "SELECT * FROM subetapas WHERE etapa_id = ANY($1) ORDER BY order_index",
                [etapaIds]
            );

            subetapasRows = subetapasResult.rows;

            const subetapaIds = subetapasRows.map((s) => s.id);

            if (subetapaIds.length > 0) {

                const atividadesResult = await pool.query(
                    "SELECT * FROM atividades_catalogo WHERE subetapa_id = ANY($1) ORDER BY order_index",
                    [subetapaIds]
                );

                atividadesRows = atividadesResult.rows;

            }

        }

        // Monta a árvore juntando as 3 listas pelos IDs
        const etapas = etapasResult.rows.map((etapa) => ({
            ...etapa,
            subetapas: subetapasRows
                .filter((sub) => sub.etapa_id === etapa.id)
                .map((sub) => ({
                    ...sub,
                    atividades: atividadesRows.filter((atv) => atv.subetapa_id === sub.id)
                }))
        }));

        res.json(etapas);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar a estrutura da obra." });
    }

}

/* ==========================================================
   ETAPAS
========================================================== */

async function criarEtapa(req, res) {

    const { obraId } = req.params;
    const { name, prazoDias } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Nome da etapa é obrigatório." });
    }

    try {

        const countResult = await pool.query(
            "SELECT COUNT(*) FROM etapas WHERE obra_id = $1",
            [obraId]
        );

        const orderIndex = Number(countResult.rows[0].count);

        const result = await pool.query(
            `INSERT INTO etapas (obra_id, name, order_index, prazo_dias)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [obraId, name, orderIndex, prazoDias || null]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar etapa." });
    }

}

async function atualizarEtapa(req, res) {

    const { id } = req.params;
    const { name, prazoDias } = req.body;

    try {

        const result = await pool.query(
            `UPDATE etapas SET name = COALESCE($1, name), prazo_dias = $2
             WHERE id = $3 RETURNING *`,
            [name || null, prazoDias ?? null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Etapa não encontrada." });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar etapa." });
    }

}

async function excluirEtapa(req, res) {

    const { id } = req.params;

    try {

        // ON DELETE CASCADE no banco já apaga subetapas e atividades juntas.
        const result = await pool.query("DELETE FROM etapas WHERE id = $1 RETURNING id", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Etapa não encontrada." });
        }

        res.status(204).send();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao excluir etapa." });
    }

}

/* ==========================================================
   SUBETAPAS
========================================================== */

async function criarSubetapa(req, res) {

    const { etapaId } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Nome da subetapa é obrigatório." });
    }

    try {

        const countResult = await pool.query(
            "SELECT COUNT(*) FROM subetapas WHERE etapa_id = $1",
            [etapaId]
        );

        const orderIndex = Number(countResult.rows[0].count);

        const result = await pool.query(
            `INSERT INTO subetapas (etapa_id, name, order_index)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [etapaId, name, orderIndex]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar subetapa." });
    }

}

async function atualizarSubetapa(req, res) {

    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Nome da subetapa é obrigatório." });
    }

    try {

        const result = await pool.query(
            "UPDATE subetapas SET name = $1 WHERE id = $2 RETURNING *",
            [name, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Subetapa não encontrada." });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar subetapa." });
    }

}

async function excluirSubetapa(req, res) {

    const { id } = req.params;

    try {

        const result = await pool.query("DELETE FROM subetapas WHERE id = $1 RETURNING id", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Subetapa não encontrada." });
        }

        res.status(204).send();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao excluir subetapa." });
    }

}

/* ==========================================================
   ATIVIDADES DO CATÁLOGO
========================================================== */

async function criarAtividade(req, res) {

    const { subetapaId } = req.params;
    const { name, prazoDias, quantidadeTotal, unidade } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Nome da atividade é obrigatório." });
    }

    if ((quantidadeTotal && !unidade) || (!quantidadeTotal && unidade)) {
        return res.status(400).json({ error: "Quantidade e unidade precisam ser preenchidas juntas." });
    }

    try {

        const countResult = await pool.query(
            "SELECT COUNT(*) FROM atividades_catalogo WHERE subetapa_id = $1",
            [subetapaId]
        );

        const orderIndex = Number(countResult.rows[0].count);

        const result = await pool.query(
            `INSERT INTO atividades_catalogo (subetapa_id, name, order_index, prazo_dias, quantidade_total, unidade)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [subetapaId, name, orderIndex, prazoDias || null, quantidadeTotal || null, unidade || null]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar atividade." });
    }

}

async function atualizarAtividade(req, res) {

    const { id } = req.params;
    const { name, prazoDias, quantidadeTotal, unidade, finalizada } = req.body;

    try {

        const result = await pool.query(
            `UPDATE atividades_catalogo
             SET name = COALESCE($1, name),
                 prazo_dias = $2,
                 quantidade_total = $3,
                 unidade = $4,
                 finalizada = COALESCE($5, finalizada),
                 finalizada_em = CASE WHEN $5 = TRUE THEN COALESCE(finalizada_em, CURRENT_DATE)
                                      WHEN $5 = FALSE THEN NULL
                                      ELSE finalizada_em END
             WHERE id = $6
             RETURNING *`,
            [name || null, prazoDias ?? null, quantidadeTotal ?? null, unidade ?? null, finalizada ?? null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Atividade não encontrada." });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar atividade." });
    }

}

async function excluirAtividade(req, res) {

    const { id } = req.params;

    try {

        const result = await pool.query(
            "DELETE FROM atividades_catalogo WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Atividade não encontrada." });
        }

        res.status(204).send();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao excluir atividade." });
    }

}

module.exports = {
    listarEstrutura,
    criarEtapa, atualizarEtapa, excluirEtapa,
    criarSubetapa, atualizarSubetapa, excluirSubetapa,
    criarAtividade, atualizarAtividade, excluirAtividade
};

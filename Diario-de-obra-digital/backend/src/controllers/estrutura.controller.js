/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: estrutura.controller.js
   Descrição: CRUD de Etapas, Subetapas e Atividades cadastradas
   (a "ficha técnica" da obra, separada dos RDOs do dia a dia).

   IMPORTANTE: toda função aqui confere se o registro realmente
   pertence a uma obra do usuário logado (req.userId), subindo
   a árvore quando necessário (atividade -> subetapa -> etapa
   -> obra). Sem isso, alguém poderia editar/excluir a estrutura
   de uma obra de outra pessoa só sabendo o ID.
========================================================== */

const pool = require("../db");
const {
    getObraIdDaEtapa,
    getObraIdDaSubetapa,
    obraPertenceAoUsuario
} = require("../utils/obraOwnership");

/* ==========================================================
   GET /obras/:obraId/estrutura
========================================================== */

async function listarEstrutura(req, res) {

    const { obraId } = req.params;

    try {

        const pertence = await obraPertenceAoUsuario(obraId, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Obra não encontrada." });
        }

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

        const pertence = await obraPertenceAoUsuario(obraId, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Obra não encontrada." });
        }

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

        const atual = await pool.query("SELECT * FROM etapas WHERE id = $1", [id]);

        if (atual.rows.length === 0) {
            return res.status(404).json({ error: "Etapa não encontrada." });
        }

        const existente = atual.rows[0];

        const pertence = await obraPertenceAoUsuario(existente.obra_id, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Etapa não encontrada." });
        }

        const result = await pool.query(
            `UPDATE etapas SET name = $1, prazo_dias = $2 WHERE id = $3 RETURNING *`,
            [
                name !== undefined ? name : existente.name,
                prazoDias !== undefined ? prazoDias : existente.prazo_dias,
                id
            ]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar etapa." });
    }

}

async function excluirEtapa(req, res) {

    const { id } = req.params;

    try {

        const atual = await pool.query("SELECT obra_id FROM etapas WHERE id = $1", [id]);

        if (atual.rows.length === 0) {
            return res.status(404).json({ error: "Etapa não encontrada." });
        }

        const pertence = await obraPertenceAoUsuario(atual.rows[0].obra_id, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Etapa não encontrada." });
        }

        await pool.query("DELETE FROM etapas WHERE id = $1", [id]);

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

        const obraId = await getObraIdDaEtapa(etapaId);

        const pertence = await obraPertenceAoUsuario(obraId, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Etapa não encontrada." });
        }

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

        const obraId = await getObraIdDaSubetapa(id);

        const pertence = await obraPertenceAoUsuario(obraId, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Subetapa não encontrada." });
        }

        const result = await pool.query(
            "UPDATE subetapas SET name = $1 WHERE id = $2 RETURNING *",
            [name, id]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar subetapa." });
    }

}

async function excluirSubetapa(req, res) {

    const { id } = req.params;

    try {

        const obraId = await getObraIdDaSubetapa(id);

        const pertence = await obraPertenceAoUsuario(obraId, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Subetapa não encontrada." });
        }

        await pool.query("DELETE FROM subetapas WHERE id = $1", [id]);

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

        const obraId = await getObraIdDaSubetapa(subetapaId);

        const pertence = await obraPertenceAoUsuario(obraId, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Subetapa não encontrada." });
        }

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

        const atual = await pool.query("SELECT * FROM atividades_catalogo WHERE id = $1", [id]);

        if (atual.rows.length === 0) {
            return res.status(404).json({ error: "Atividade não encontrada." });
        }

        const existente = atual.rows[0];

        const obraId = await getObraIdDaSubetapa(existente.subetapa_id);

        const pertence = await obraPertenceAoUsuario(obraId, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Atividade não encontrada." });
        }

        const novoNome = name !== undefined ? name : existente.name;
        const novoPrazo = prazoDias !== undefined ? prazoDias : existente.prazo_dias;
        const novaQuantidade = quantidadeTotal !== undefined ? quantidadeTotal : existente.quantidade_total;
        const novaUnidade = unidade !== undefined ? unidade : existente.unidade;
        const novaFinalizada = finalizada !== undefined ? finalizada : existente.finalizada;

        let novaFinalizadaEm = existente.finalizada_em;

        if (finalizada !== undefined && finalizada !== existente.finalizada) {
            novaFinalizadaEm = finalizada ? new Date() : null;
        }

        const result = await pool.query(
            `UPDATE atividades_catalogo
             SET name = $1, prazo_dias = $2, quantidade_total = $3, unidade = $4,
                 finalizada = $5, finalizada_em = $6
             WHERE id = $7
             RETURNING *`,
            [novoNome, novoPrazo, novaQuantidade, novaUnidade, novaFinalizada, novaFinalizadaEm, id]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar atividade." });
    }

}

async function excluirAtividade(req, res) {

    const { id } = req.params;

    try {

        const atual = await pool.query("SELECT subetapa_id FROM atividades_catalogo WHERE id = $1", [id]);

        if (atual.rows.length === 0) {
            return res.status(404).json({ error: "Atividade não encontrada." });
        }

        const obraId = await getObraIdDaSubetapa(atual.rows[0].subetapa_id);

        const pertence = await obraPertenceAoUsuario(obraId, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Atividade não encontrada." });
        }

        await pool.query("DELETE FROM atividades_catalogo WHERE id = $1", [id]);

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

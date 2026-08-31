/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: equipamentos.controller.js
   Descrição: CRUD dos Equipamentos cadastrados na obra.
========================================================== */

const pool = require("../db");

async function listar(req, res) {

    const { obraId } = req.params;

    try {

        const result = await pool.query(
            "SELECT * FROM equipamentos WHERE obra_id = $1 ORDER BY name",
            [obraId]
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar equipamentos." });
    }

}

async function criar(req, res) {

    const { obraId } = req.params;
    const { name, tipo, identificacao, observacao } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Nome do equipamento é obrigatório." });
    }

    try {

        const result = await pool.query(
            `INSERT INTO equipamentos (obra_id, name, tipo, identificacao, observacao)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [obraId, name, tipo || null, identificacao || null, observacao || null]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao cadastrar equipamento." });
    }

}

async function atualizar(req, res) {

    const { id } = req.params;
    const { name, tipo, identificacao, observacao, status } = req.body;

    try {

        const result = await pool.query(
            `UPDATE equipamentos SET
                name = COALESCE($1, name),
                tipo = $2,
                identificacao = $3,
                observacao = $4,
                status = COALESCE($5, status)
             WHERE id = $6
             RETURNING *`,
            [name || null, tipo ?? null, identificacao ?? null, observacao ?? null, status || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Equipamento não encontrado." });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar equipamento." });
    }

}

async function excluir(req, res) {

    const { id } = req.params;

    try {

        const result = await pool.query("DELETE FROM equipamentos WHERE id = $1 RETURNING id", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Equipamento não encontrado." });
        }

        res.status(204).send();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao excluir equipamento." });
    }

}

module.exports = { listar, criar, atualizar, excluir };

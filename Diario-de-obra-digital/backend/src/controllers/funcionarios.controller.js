/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: funcionarios.controller.js
   Descrição: CRUD da Equipe própria da obra.
========================================================== */

const pool = require("../db");
const { obraPertenceAoUsuario } = require("../utils/obraOwnership");

async function listar(req, res) {

    const { obraId } = req.params;

    try {

        const pertence = await obraPertenceAoUsuario(obraId, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Obra não encontrada." });
        }

        const result = await pool.query(
            "SELECT * FROM funcionarios WHERE obra_id = $1 ORDER BY name",
            [obraId]
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar funcionários." });
    }

}

async function criar(req, res) {

    const { obraId } = req.params;
    const { name, funcao, matricula, observacao } = req.body;

    if (!name || !funcao) {
        return res.status(400).json({ error: "Nome e função são obrigatórios." });
    }

    try {

        const pertence = await obraPertenceAoUsuario(obraId, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Obra não encontrada." });
        }

        const result = await pool.query(
            `INSERT INTO funcionarios (obra_id, name, funcao, matricula, observacao)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [obraId, name, funcao, matricula || null, observacao || null]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao cadastrar funcionário." });
    }

}

async function atualizar(req, res) {

    const { id } = req.params;
    const { name, funcao, matricula, observacao, status } = req.body;

    try {

        const atual = await pool.query("SELECT * FROM funcionarios WHERE id = $1", [id]);

        if (atual.rows.length === 0) {
            return res.status(404).json({ error: "Funcionário não encontrado." });
        }

        const existente = atual.rows[0];

        const pertence = await obraPertenceAoUsuario(existente.obra_id, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Funcionário não encontrado." });
        }

        const result = await pool.query(
            `UPDATE funcionarios SET
                name = $1, funcao = $2, matricula = $3, observacao = $4, status = $5
             WHERE id = $6
             RETURNING *`,
            [
                name !== undefined ? name : existente.name,
                funcao !== undefined ? funcao : existente.funcao,
                matricula !== undefined ? matricula : existente.matricula,
                observacao !== undefined ? observacao : existente.observacao,
                status !== undefined ? status : existente.status,
                id
            ]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar funcionário." });
    }

}

async function excluir(req, res) {

    const { id } = req.params;

    try {

        const atual = await pool.query("SELECT obra_id FROM funcionarios WHERE id = $1", [id]);

        if (atual.rows.length === 0) {
            return res.status(404).json({ error: "Funcionário não encontrado." });
        }

        const pertence = await obraPertenceAoUsuario(atual.rows[0].obra_id, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Funcionário não encontrado." });
        }

        await pool.query("DELETE FROM funcionarios WHERE id = $1", [id]);

        res.status(204).send();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao excluir funcionário." });
    }

}

module.exports = { listar, criar, atualizar, excluir };

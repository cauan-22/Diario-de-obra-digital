/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: terceirizados.controller.js
   Descrição: CRUD de Empresas Terceirizadas e dos funcionários
   vinculados a cada uma.
========================================================== */

const pool = require("../db");

/* ==========================================================
   GET /obras/:obraId/empresas
   Devolve as empresas já com os funcionários dentro.
========================================================== */

async function listar(req, res) {

    const { obraId } = req.params;

    try {

        const empresasResult = await pool.query(
            "SELECT * FROM empresas_terceirizadas WHERE obra_id = $1 ORDER BY name",
            [obraId]
        );

        const empresaIds = empresasResult.rows.map((e) => e.id);

        let funcionariosRows = [];

        if (empresaIds.length > 0) {

            const funcionariosResult = await pool.query(
                "SELECT * FROM funcionarios_terceirizados WHERE empresa_id = ANY($1) ORDER BY name",
                [empresaIds]
            );

            funcionariosRows = funcionariosResult.rows;

        }

        const empresas = empresasResult.rows.map((empresa) => ({
            ...empresa,
            funcionarios: funcionariosRows.filter((f) => f.empresa_id === empresa.id)
        }));

        res.json(empresas);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar empresas terceirizadas." });
    }

}

/* ==========================================================
   EMPRESAS
========================================================== */

async function criarEmpresa(req, res) {

    const { obraId } = req.params;
    const { name, especialidade } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Nome da empresa é obrigatório." });
    }

    try {

        const result = await pool.query(
            `INSERT INTO empresas_terceirizadas (obra_id, name, especialidade)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [obraId, name, especialidade || null]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao cadastrar empresa." });
    }

}

async function atualizarEmpresa(req, res) {

    const { id } = req.params;
    const { name, especialidade } = req.body;

    try {

        const result = await pool.query(
            `UPDATE empresas_terceirizadas
             SET name = COALESCE($1, name), especialidade = $2
             WHERE id = $3
             RETURNING *`,
            [name || null, especialidade ?? null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar empresa." });
    }

}

async function excluirEmpresa(req, res) {

    const { id } = req.params;

    try {

        // ON DELETE CASCADE no banco já apaga os funcionários junto.
        const result = await pool.query(
            "DELETE FROM empresas_terceirizadas WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        res.status(204).send();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao excluir empresa." });
    }

}

/* ==========================================================
   FUNCIONÁRIOS TERCEIRIZADOS
========================================================== */

async function criarFuncionario(req, res) {

    const { empresaId } = req.params;
    const { name, funcao } = req.body;

    if (!name || !funcao) {
        return res.status(400).json({ error: "Nome e função são obrigatórios." });
    }

    try {

        const result = await pool.query(
            `INSERT INTO funcionarios_terceirizados (empresa_id, name, funcao)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [empresaId, name, funcao]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao cadastrar funcionário." });
    }

}

async function atualizarFuncionario(req, res) {

    const { id } = req.params;
    const { name, funcao, status } = req.body;

    try {

        const result = await pool.query(
            `UPDATE funcionarios_terceirizados SET
                name = COALESCE($1, name),
                funcao = COALESCE($2, funcao),
                status = COALESCE($3, status)
             WHERE id = $4
             RETURNING *`,
            [name || null, funcao || null, status || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Funcionário não encontrado." });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar funcionário." });
    }

}

async function excluirFuncionario(req, res) {

    const { id } = req.params;

    try {

        const result = await pool.query(
            "DELETE FROM funcionarios_terceirizados WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Funcionário não encontrado." });
        }

        res.status(204).send();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao excluir funcionário." });
    }

}

module.exports = {
    listar,
    criarEmpresa, atualizarEmpresa, excluirEmpresa,
    criarFuncionario, atualizarFuncionario, excluirFuncionario
};

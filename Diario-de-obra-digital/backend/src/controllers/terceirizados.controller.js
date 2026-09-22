/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: terceirizados.controller.js
   Descrição: CRUD de Empresas Terceirizadas e dos funcionários
   vinculados a cada uma.
========================================================== */

const pool = require("../db");
const {
    obraPertenceAoUsuario,
    getObraIdDoFuncionarioTerceirizado
} = require("../utils/obraOwnership");

async function listar(req, res) {

    const { obraId } = req.params;

    try {

        const pertence = await obraPertenceAoUsuario(obraId, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Obra não encontrada." });
        }

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

async function criarEmpresa(req, res) {

    const { obraId } = req.params;
    const { name, especialidade } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Nome da empresa é obrigatório." });
    }

    try {

        const pertence = await obraPertenceAoUsuario(obraId, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Obra não encontrada." });
        }

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

        const atual = await pool.query("SELECT * FROM empresas_terceirizadas WHERE id = $1", [id]);

        if (atual.rows.length === 0) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        const existente = atual.rows[0];

        const pertence = await obraPertenceAoUsuario(existente.obra_id, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        const result = await pool.query(
            `UPDATE empresas_terceirizadas
             SET name = $1, especialidade = $2
             WHERE id = $3
             RETURNING *`,
            [
                name !== undefined ? name : existente.name,
                especialidade !== undefined ? especialidade : existente.especialidade,
                id
            ]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar empresa." });
    }

}

async function excluirEmpresa(req, res) {

    const { id } = req.params;

    try {

        const atual = await pool.query("SELECT obra_id FROM empresas_terceirizadas WHERE id = $1", [id]);

        if (atual.rows.length === 0) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        const pertence = await obraPertenceAoUsuario(atual.rows[0].obra_id, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        await pool.query("DELETE FROM empresas_terceirizadas WHERE id = $1", [id]);

        res.status(204).send();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao excluir empresa." });
    }

}

async function criarFuncionario(req, res) {

    const { empresaId } = req.params;
    const { name, funcao } = req.body;

    if (!name || !funcao) {
        return res.status(400).json({ error: "Nome e função são obrigatórios." });
    }

    try {

        const empresaResult = await pool.query(
            "SELECT obra_id FROM empresas_terceirizadas WHERE id = $1",
            [empresaId]
        );

        if (empresaResult.rows.length === 0) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        const pertence = await obraPertenceAoUsuario(empresaResult.rows[0].obra_id, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

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

        const atual = await pool.query("SELECT * FROM funcionarios_terceirizados WHERE id = $1", [id]);

        if (atual.rows.length === 0) {
            return res.status(404).json({ error: "Funcionário não encontrado." });
        }

        const existente = atual.rows[0];

        const obraId = await getObraIdDoFuncionarioTerceirizado(id);

        const pertence = await obraPertenceAoUsuario(obraId, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Funcionário não encontrado." });
        }

        const result = await pool.query(
            `UPDATE funcionarios_terceirizados SET
                name = $1, funcao = $2, status = $3
             WHERE id = $4
             RETURNING *`,
            [
                name !== undefined ? name : existente.name,
                funcao !== undefined ? funcao : existente.funcao,
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

async function excluirFuncionario(req, res) {

    const { id } = req.params;

    try {

        const obraId = await getObraIdDoFuncionarioTerceirizado(id);

        if (!obraId) {
            return res.status(404).json({ error: "Funcionário não encontrado." });
        }

        const pertence = await obraPertenceAoUsuario(obraId, req.userId);

        if (!pertence) {
            return res.status(404).json({ error: "Funcionário não encontrado." });
        }

        await pool.query("DELETE FROM funcionarios_terceirizados WHERE id = $1", [id]);

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

/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: obras.controller.js
========================================================== */

const pool = require("../db");

/* ==========================================================
   GET /obras
========================================================== */

async function listar(req, res) {

    try {

        const result = await pool.query(
            "SELECT * FROM obras ORDER BY created_at DESC"
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar obras." });
    }

}

/* ==========================================================
   GET /obras/:id
========================================================== */

async function buscarPorId(req, res) {

    const { id } = req.params;

    try {

        const result = await pool.query(
            "SELECT * FROM obras WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Obra não encontrada." });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar obra." });
    }

}

/* ==========================================================
   POST /obras (precisa estar logado)
========================================================== */

async function criar(req, res) {

    const {
        name, client, contract, status, address, city, state, cep,
        responsible, registrationType, registrationNumber,
        startDate, expectedEndDate, description, budget, area, units
    } = req.body;

    if (!name || !client || !city || !state || !responsible || !registrationNumber || !startDate) {
        return res.status(400).json({ error: "Preencha os campos obrigatórios da obra." });
    }

    try {

        const result = await pool.query(
            `INSERT INTO obras (
                name, client, contract, status, address, city, state, cep,
                responsible, registration_type, registration_number,
                start_date, expected_end_date, description, budget, area, units,
                owner_user_id
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
            RETURNING *`,
            [
                name, client, contract || null, status || "ativa", address || null, city, state, cep || null,
                responsible, registrationType || null, registrationNumber,
                startDate, expectedEndDate || null, description || null, budget || null, area || null, units || null,
                req.userId
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar obra." });
    }

}

/* ==========================================================
   PUT /obras/:id (precisa estar logado)
   Atualiza só os campos enviados no corpo da requisição.
========================================================== */

async function atualizar(req, res) {

    const { id } = req.params;
    const fields = req.body;

    const allowedFields = [
        "name", "client", "contract", "status", "address", "city", "state", "cep",
        "responsible", "registration_type", "registration_number",
        "start_date", "expected_end_date", "description", "budget", "area", "units"
    ];

    const updates = [];
    const values = [];
    let index = 1;

    allowedFields.forEach((field) => {

        if (fields[field] !== undefined) {
            updates.push(`${field} = $${index}`);
            values.push(fields[field]);
            index++;
        }

    });

    if (updates.length === 0) {
        return res.status(400).json({ error: "Nenhum campo para atualizar." });
    }

    values.push(id);

    try {

        const result = await pool.query(
            `UPDATE obras SET ${updates.join(", ")} WHERE id = $${index} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Obra não encontrada." });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar obra." });
    }

}

module.exports = { listar, buscarPorId, criar, atualizar };

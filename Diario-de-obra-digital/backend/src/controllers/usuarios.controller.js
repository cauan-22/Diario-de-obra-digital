/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: usuarios.controller.js
   Descrição: Lógica de cadastro, login e perfil de usuário.
========================================================== */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const pool = require("../db");

const SALT_ROUNDS = 10;

/* ==========================================================
   POST /usuarios/cadastro
========================================================== */

async function cadastrar(req, res) {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "A senha precisa ter pelo menos 6 caracteres." });
    }

    try {

        const existingUser = await pool.query(
            "SELECT id FROM usuarios WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: "Já existe uma conta com esse e-mail." });
        }

        // Nunca guardamos a senha em texto puro — só o hash.
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            `INSERT INTO usuarios (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, created_at`,
            [name, email, passwordHash]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar a conta." });
    }

}

/* ==========================================================
   POST /usuarios/login
========================================================== */

async function login(req, res) {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    try {

        const result = await pool.query(
            "SELECT * FROM usuarios WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "E-mail ou senha inválidos." });
        }

        const user = result.rows[0];

        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatches) {
            return res.status(401).json({ error: "E-mail ou senha inválidos." });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao fazer login." });
    }

}

/* ==========================================================
   GET /usuarios/perfil (precisa estar logado)
========================================================== */

async function getPerfil(req, res) {

    try {

        const result = await pool.query(
            `SELECT id, name, email, phone, role, company,
                    registration_type, registration_number, created_at
             FROM usuarios
             WHERE id = $1`,
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar perfil." });
    }

}

module.exports = { cadastrar, login, getPerfil };

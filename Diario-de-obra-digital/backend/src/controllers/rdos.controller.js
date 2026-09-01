/* ==========================================================
   BUILDTRACK BACKEND
   Arquivo: rdos.controller.js
   Descrição: CRUD de RDOs (a parte mais complexa da API —
   um RDO mexe em 7 tabelas ao mesmo tempo) e geração de PDF.
========================================================== */

const pool = require("../db");
const PDFDocument = require("pdfkit");

/* Conta o total de "pessoas" numa lista de descrições manuais,
   igual à lógica que já existe no frontend (ex: "02 Pedreiros" -> 2). */

function countManualWorkers(descriptions) {

    return descriptions.reduce((total, text) => {
        const match = text.match(/^(\d+)/);
        return total + (match ? Number(match[1]) : 1);
    }, 0);

}

/* ==========================================================
   GET /obras/:obraId/rdos/next-number
   Mostra qual vai ser o próximo número, antes de criar
   (usado pela tela "Novo RDO" pra exibir "RDO Nº 013").
========================================================== */

async function getNextRdoNumber(req, res) {

    const { obraId } = req.params;

    try {

        const result = await pool.query(
            "SELECT COALESCE(MAX(rdo_number), 0) + 1 AS next_number FROM rdos WHERE obra_id = $1",
            [obraId]
        );

        res.json({ nextNumber: result.rows[0].next_number });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao calcular o próximo número do RDO." });
    }

}

/* ==========================================================
   GET /obras/:obraId/rdos — lista resumida (histórico da obra)
========================================================== */

async function listar(req, res) {

    const { obraId } = req.params;

    try {

        const rdosResult = await pool.query(
            "SELECT * FROM rdos WHERE obra_id = $1 ORDER BY rdo_number DESC",
            [obraId]
        );

        const rdoIds = rdosResult.rows.map((r) => r.id);

        if (rdoIds.length === 0) {
            return res.json([]);
        }

        const [ownRows, outRows, activitiesRows, materialsRows, photosRows] = await Promise.all([
            pool.query("SELECT * FROM rdo_workers_own WHERE rdo_id = ANY($1)", [rdoIds]),
            pool.query("SELECT * FROM rdo_workers_outsourced WHERE rdo_id = ANY($1)", [rdoIds]),
            pool.query("SELECT * FROM rdo_activities WHERE rdo_id = ANY($1)", [rdoIds]),
            pool.query("SELECT * FROM rdo_materials WHERE rdo_id = ANY($1)", [rdoIds]),
            pool.query("SELECT * FROM rdo_photos WHERE rdo_id = ANY($1)", [rdoIds])
        ]);

        const summaries = rdosResult.rows.map((rdo) => {

            const own = ownRows.rows.filter((w) => w.rdo_id === rdo.id);
            const out = outRows.rows.filter((w) => w.rdo_id === rdo.id);

            const ownCount = own.filter((w) => w.funcionario_id).length
                + countManualWorkers(own.filter((w) => w.manual_description).map((w) => w.manual_description));

            const outCount = out.filter((w) => w.funcionario_terceirizado_id).length
                + countManualWorkers(out.filter((w) => w.manual_description).map((w) => w.manual_description));

            return {
                id: rdo.id,
                rdoNumber: rdo.rdo_number,
                date: rdo.date,
                workers: ownCount + outCount,
                activities: activitiesRows.rows.filter((a) => a.rdo_id === rdo.id).length,
                materials: materialsRows.rows.filter((m) => m.rdo_id === rdo.id).length,
                occurrences: rdo.occurrence_text ? 1 : 0,
                photos: photosRows.rows.filter((p) => p.rdo_id === rdo.id).length
            };

        });

        res.json(summaries);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar RDOs." });
    }

}

/* ==========================================================
   Busca um RDO completo, com todas as tabelas relacionadas
   já juntadas. Reaproveitado por buscarPorId() e gerarPDF().
========================================================== */

async function buscarRDOCompleto(id) {

    const rdoResult = await pool.query(
        `SELECT rdos.*, obras.name AS obra_name, obras.city, obras.state
         FROM rdos
         JOIN obras ON obras.id = rdos.obra_id
         WHERE rdos.id = $1`,
        [id]
    );

    if (rdoResult.rows.length === 0) return null;

    const rdo = rdoResult.rows[0];

    const [activities, workersOwn, workersOut, equipment, materials, photos] = await Promise.all([

        pool.query(
            "SELECT * FROM rdo_activities WHERE rdo_id = $1 ORDER BY order_index",
            [id]
        ),

        pool.query(
            `SELECT rdo_workers_own.*, funcionarios.name AS funcionario_name, funcionarios.funcao
             FROM rdo_workers_own
             LEFT JOIN funcionarios ON funcionarios.id = rdo_workers_own.funcionario_id
             WHERE rdo_id = $1`,
            [id]
        ),

        pool.query(
            `SELECT rdo_workers_outsourced.*, funcionarios_terceirizados.name AS funcionario_name,
                    funcionarios_terceirizados.funcao, empresas_terceirizadas.name AS empresa_name
             FROM rdo_workers_outsourced
             LEFT JOIN funcionarios_terceirizados ON funcionarios_terceirizados.id = rdo_workers_outsourced.funcionario_terceirizado_id
             LEFT JOIN empresas_terceirizadas ON empresas_terceirizadas.id = funcionarios_terceirizados.empresa_id
             WHERE rdo_id = $1`,
            [id]
        ),

        pool.query(
            `SELECT rdo_equipment.*, equipamentos.name AS equipment_name, equipamentos.tipo
             FROM rdo_equipment
             LEFT JOIN equipamentos ON equipamentos.id = rdo_equipment.equipment_id
             WHERE rdo_id = $1`,
            [id]
        ),

        pool.query("SELECT * FROM rdo_materials WHERE rdo_id = $1", [id]),
        pool.query("SELECT * FROM rdo_photos WHERE rdo_id = $1", [id])

    ]);

    return {
        ...rdo,
        activities: activities.rows,
        workersOwn: workersOwn.rows,
        workersOutsourced: workersOut.rows,
        equipment: equipment.rows,
        materials: materials.rows,
        photos: photos.rows
    };

}

/* ==========================================================
   GET /rdos/:id
========================================================== */

async function buscarPorId(req, res) {

    const { id } = req.params;

    try {

        const rdo = await buscarRDOCompleto(id);

        if (!rdo) {
            return res.status(404).json({ error: "RDO não encontrado." });
        }

        res.json(rdo);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar RDO." });
    }

}

/* ==========================================================
   Insere todas as "tabelas filhas" de um RDO (usado tanto na
   criação quanto na edição, pra não duplicar esse bloco).
========================================================== */

async function inserirDadosRelacionados(client, rdoId, dados) {

    const {
        activities = [], workersOwn = [], workersOutsourced = [],
        equipment = [], materials = [], photos = []
    } = dados;

    for (let i = 0; i < activities.length; i++) {

        const activity = activities[i];

        await client.query(
            `INSERT INTO rdo_activities (
                rdo_id, activity_id, etapa_snapshot, subetapa_snapshot, atividade_snapshot,
                manual_description, quantidade_realizada, observation, order_index
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [
                rdoId, activity.activityId || null,
                activity.etapaSnapshot || null, activity.subetapaSnapshot || null, activity.atividadeSnapshot || null,
                activity.manualDescription || null, activity.quantidadeRealizada ?? null,
                activity.observation || null, i
            ]
        );

    }

    for (const worker of workersOwn) {

        await client.query(
            `INSERT INTO rdo_workers_own (rdo_id, funcionario_id, manual_description)
             VALUES ($1, $2, $3)`,
            [rdoId, worker.funcionarioId || null, worker.manualDescription || null]
        );

    }

    for (const worker of workersOutsourced) {

        await client.query(
            `INSERT INTO rdo_workers_outsourced (rdo_id, funcionario_terceirizado_id, manual_description)
             VALUES ($1, $2, $3)`,
            [rdoId, worker.funcionarioTerceirizadoId || null, worker.manualDescription || null]
        );

    }

    for (const item of equipment) {

        await client.query(
            `INSERT INTO rdo_equipment (rdo_id, equipment_id, manual_description, status_dia)
             VALUES ($1, $2, $3, $4)`,
            [rdoId, item.equipmentId || null, item.manualDescription || null, item.statusDia]
        );

    }

    for (const material of materials) {

        await client.query(
            `INSERT INTO rdo_materials (rdo_id, name, fornecedor, nota_fiscal, quantidade)
             VALUES ($1, $2, $3, $4, $5)`,
            [rdoId, material.name, material.fornecedor || null, material.notaFiscal || null, material.quantidade || null]
        );

    }

    for (const photo of photos) {

        await client.query(
            `INSERT INTO rdo_photos (rdo_id, url, description)
             VALUES ($1, $2, $3)`,
            [rdoId, photo.url, photo.description || null]
        );

    }

}

/* ==========================================================
   POST /obras/:obraId/rdos (precisa estar logado)
========================================================== */

async function criar(req, res) {

    const { obraId } = req.params;

    const {
        date, weekday, weatherManha, weatherTarde, weatherImpact,
        workforceObservation, materialTests, occurrenceText, observations
    } = req.body;

    if (!date) {
        return res.status(400).json({ error: "Data é obrigatória." });
    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const nextNumberResult = await client.query(
            "SELECT COALESCE(MAX(rdo_number), 0) + 1 AS next_number FROM rdos WHERE obra_id = $1",
            [obraId]
        );

        const rdoNumber = nextNumberResult.rows[0].next_number;

        const rdoResult = await client.query(
            `INSERT INTO rdos (
                obra_id, rdo_number, date, weekday, weather_manha, weather_tarde,
                weather_impact, workforce_observation, material_tests,
                occurrence_text, observations, created_by
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            RETURNING *`,
            [
                obraId, rdoNumber, date, weekday || null, weatherManha || null, weatherTarde || null,
                weatherImpact || null, workforceObservation || null, materialTests || null,
                occurrenceText || null, observations || null, req.userId
            ]
        );

        const rdo = rdoResult.rows[0];

        await inserirDadosRelacionados(client, rdo.id, req.body);

        await client.query("COMMIT");

        const rdoCompleto = await buscarRDOCompleto(rdo.id);

        res.status(201).json(rdoCompleto);

    } catch (error) {

        await client.query("ROLLBACK");
        console.error(error);

        if (error.code === "23505") {
            return res.status(409).json({ error: "Já existe um RDO com esse número nesta obra." });
        }

        res.status(500).json({ error: "Erro ao criar RDO." });

    } finally {
        client.release();
    }

}

/* ==========================================================
   PUT /rdos/:id (precisa estar logado)
   Estratégia: apaga as "tabelas filhas" antigas e insere as
   novas — mais simples e seguro do que comparar item a item.
========================================================== */

async function atualizar(req, res) {

    const { id } = req.params;

    const {
        date, weekday, weatherManha, weatherTarde, weatherImpact,
        workforceObservation, materialTests, occurrenceText, observations
    } = req.body;

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const rdoResult = await client.query(
            `UPDATE rdos SET
                date = COALESCE($1, date),
                weekday = COALESCE($2, weekday),
                weather_manha = $3,
                weather_tarde = $4,
                weather_impact = $5,
                workforce_observation = $6,
                material_tests = $7,
                occurrence_text = $8,
                observations = $9
             WHERE id = $10
             RETURNING *`,
            [
                date || null, weekday || null, weatherManha || null, weatherTarde || null,
                weatherImpact || null, workforceObservation || null, materialTests || null,
                occurrenceText || null, observations || null, id
            ]
        );

        if (rdoResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "RDO não encontrado." });
        }

        await client.query("DELETE FROM rdo_activities WHERE rdo_id = $1", [id]);
        await client.query("DELETE FROM rdo_workers_own WHERE rdo_id = $1", [id]);
        await client.query("DELETE FROM rdo_workers_outsourced WHERE rdo_id = $1", [id]);
        await client.query("DELETE FROM rdo_equipment WHERE rdo_id = $1", [id]);
        await client.query("DELETE FROM rdo_materials WHERE rdo_id = $1", [id]);
        await client.query("DELETE FROM rdo_photos WHERE rdo_id = $1", [id]);

        await inserirDadosRelacionados(client, id, req.body);

        await client.query("COMMIT");

        const rdoCompleto = await buscarRDOCompleto(id);

        res.json(rdoCompleto);

    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar RDO." });
    } finally {
        client.release();
    }

}

/* ==========================================================
   GET /rdos/:id/pdf
   Gera o PDF na hora e já manda como resposta (não salva
   arquivo nenhum no servidor).
========================================================== */

async function gerarPDF(req, res) {

    const { id } = req.params;

    try {

        const rdo = await buscarRDOCompleto(id);

        if (!rdo) {
            return res.status(404).json({ error: "RDO não encontrado." });
        }

        const numeroFormatado = String(rdo.rdo_number).padStart(3, "0");

        const doc = new PDFDocument({ margin: 40 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="RDO-${numeroFormatado}.pdf"`);

        doc.pipe(res);

        /* Cabeçalho, com a faixa amarela característica do BuildTrack */

        doc.rect(0, 0, doc.page.width, 8).fill("#F4B400");
        doc.moveDown(2);

        doc.fillColor("#1F1F1F").fontSize(20).font("Helvetica-Bold")
            .text(`RDO No ${numeroFormatado}`);

        doc.fontSize(12).font("Helvetica").fillColor("#6B6B6B")
            .text(`${rdo.obra_name} - ${rdo.city} / ${rdo.state}`)
            .text(new Date(rdo.date).toLocaleDateString("pt-BR"));

        doc.moveDown(1);
        doc.strokeColor("#D8D8D8").moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();

        function sectionTitle(text) {
            doc.moveDown(1);
            doc.fillColor("#1F1F1F").fontSize(13).font("Helvetica-Bold").text(text.toUpperCase());
            doc.moveDown(0.3);
            doc.fontSize(11).font("Helvetica").fillColor("#1F1F1F");
        }

        sectionTitle("Condicoes climaticas");
        doc.text(`Manha: ${rdo.weather_manha || "-"}     Tarde: ${rdo.weather_tarde || "-"}`);
        if (rdo.weather_impact) doc.text(`Impacto no cronograma: ${rdo.weather_impact}`);

        sectionTitle("Mao de obra");

        rdo.workersOwn.forEach((w) => {
            const label = w.funcionario_name ? `${w.funcionario_name} (${w.funcao})` : w.manual_description;
            doc.text(`- ${label}`);
        });

        rdo.workersOutsourced.forEach((w) => {
            const label = w.funcionario_name
                ? `${w.funcionario_name} (${w.funcao}) - ${w.empresa_name}`
                : w.manual_description;
            doc.text(`- ${label}`);
        });

        if (rdo.workersOwn.length === 0 && rdo.workersOutsourced.length === 0) {
            doc.text("Nenhum trabalhador registrado.");
        }

        if (rdo.workforce_observation) doc.text(`Observacao: ${rdo.workforce_observation}`);

        sectionTitle("Equipamentos");

        if (rdo.equipment.length === 0) {
            doc.text("Nenhum equipamento registrado.");
        }

        rdo.equipment.forEach((e) => {
            const label = e.equipment_name ? `${e.equipment_name} (${e.tipo})` : e.manual_description;
            doc.text(`- ${label} - ${e.status_dia}`);
        });

        sectionTitle("Atividades realizadas");

        if (rdo.activities.length === 0) {
            doc.text("Nenhuma atividade registrada.");
        }

        rdo.activities.forEach((activity, index) => {

            const label = activity.activity_id
                ? `${activity.etapa_snapshot} > ${activity.subetapa_snapshot} > ${activity.atividade_snapshot}`
                : activity.manual_description;

            doc.text(`${String(index + 1).padStart(2, "0")}. ${label}`);

            if (activity.quantidade_realizada) {
                doc.text(`     Quantidade realizada: ${activity.quantidade_realizada}`);
            }

            if (activity.observation) {
                doc.text(`     ${activity.observation}`);
            }

        });

        sectionTitle("Materiais e suprimentos");

        if (rdo.materials.length === 0) {
            doc.text("Nenhum material registrado.");
        }

        rdo.materials.forEach((material) => {
            doc.text(`- ${material.name} - ${material.fornecedor || "-"} - NF ${material.nota_fiscal || "-"}`);
        });

        if (rdo.material_tests) doc.text(`Ensaios/testes: ${rdo.material_tests}`);

        sectionTitle("Ocorrencias");
        doc.text(rdo.occurrence_text || "Sem ocorrencias registradas.");

        sectionTitle("Observacoes gerais");
        doc.text(rdo.observations || "-");

        doc.moveDown(2);
        doc.fontSize(9).fillColor("#999999")
            .text(`Gerado pelo BuildTrack em ${new Date().toLocaleString("pt-BR")}`);

        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao gerar PDF." });
    }

}

module.exports = {
    getNextRdoNumber,
    listar,
    buscarPorId,
    criar,
    atualizar,
    gerarPDF
};

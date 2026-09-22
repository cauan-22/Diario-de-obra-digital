/* ==========================================================
   BUILDTRACK
   Arquivo: estrutura.js
   Descrição: Lógica da página Estrutura da Obra (EAP)
========================================================== */

function getObraIdFromURL() {

    const params = new URLSearchParams(window.location.search);

    return Number(params.get("id"));

}

const obraId = getObraIdFromURL();

let estrutura = { obraName: "", etapas: [] };

const expandedEtapas = new Set();
const expandedSubetapas = new Set();

/* ==========================================================
   CARREGAR DO BACKEND
========================================================== */

async function loadEstrutura() {

    try {

        const [obra, etapas] = await Promise.all([
            apiFetch(`/obras/${obraId}`),
            apiFetch(`/obras/${obraId}/estrutura`)
        ]);

        estrutura.obraName = obra.name;
        estrutura.etapas = etapas;

        document.getElementById("obra-name-subtitle").textContent =
            `${obra.name} — organize etapas, subetapas e atividades.`;

        renderEstrutura();

    } catch (error) {
        showToast(`Erro ao carregar a estrutura: ${error.message}`);
    }

}

/* ==========================================================
   RECALCULAR CÓDIGOS (01, 01.1, 01.2...)
========================================================== */

function recomputeCodes() {

    estrutura.etapas.forEach((etapa, i) => {

        etapa.displayCode = String(i + 1).padStart(2, "0");

        etapa.subetapas.forEach((sub, j) => {
            sub.displayCode = `${etapa.displayCode}.${j + 1}`;
        });

    });

}

/* ==========================================================
   RENDERIZAÇÃO DA ÁRVORE
========================================================== */

function renderEstrutura() {

    recomputeCodes();

    const list = document.getElementById("etapas-list");
    const emptyState = document.getElementById("empty-state");

    list.innerHTML = "";

    emptyState.hidden = estrutura.etapas.length > 0;

    estrutura.etapas.forEach((etapa) => {
        list.appendChild(renderEtapaBlock(etapa));
    });

}

function renderEtapaBlock(etapa) {

    const isExpanded = expandedEtapas.has(etapa.id);

    const block = document.createElement("div");

    block.className = "etapa-block";

    block.innerHTML = `

        <div class="etapa-header">

            <span class="material-symbols-outlined tree-chevron ${isExpanded ? "expanded" : ""}">
                chevron_right
            </span>

            <span class="etapa-code">${etapa.displayCode}</span>
            <span class="etapa-name">${etapa.name}</span>

            ${etapa.prazo_dias ? `<span class="tree-prazo-badge">${etapa.prazo_dias} dias</span>` : ""}

            <div class="tree-row-actions">

                <button class="tree-icon-btn" data-action="edit-etapa" aria-label="Editar etapa">
                    <span class="material-symbols-outlined">edit</span>
                </button>

                <button class="tree-icon-btn tree-icon-btn--danger" data-action="delete-etapa" aria-label="Excluir etapa">
                    <span class="material-symbols-outlined">delete</span>
                </button>

            </div>

        </div>

        <div class="subetapa-list ${isExpanded ? "expanded" : ""}" id="subetapas-${etapa.id}"></div>

    `;

    block.querySelector(".etapa-header").addEventListener("click", (event) => {

        if (event.target.closest(".tree-row-actions")) return;

        toggleEtapa(etapa.id);

    });

    block.querySelector('[data-action="edit-etapa"]').addEventListener("click", () => editEtapa(etapa.id));
    block.querySelector('[data-action="delete-etapa"]').addEventListener("click", () => deleteEtapa(etapa.id));

    const subetapasContainer = block.querySelector(`#subetapas-${etapa.id}`);

    etapa.subetapas.forEach((sub) => {
        subetapasContainer.appendChild(renderSubetapaBlock(etapa, sub));
    });

    const addSubBtn = document.createElement("button");
    addSubBtn.className = "add-item-btn tree-add-btn";
    addSubBtn.type = "button";
    addSubBtn.textContent = "+ Nova subetapa";
    addSubBtn.addEventListener("click", () => addSubetapa(etapa.id));

    subetapasContainer.appendChild(addSubBtn);

    return block;

}

function renderSubetapaBlock(etapa, sub) {

    const isExpanded = expandedSubetapas.has(sub.id);

    const block = document.createElement("div");

    block.className = "subetapa-block";

    block.innerHTML = `

        <div class="subetapa-header">

            <span class="material-symbols-outlined tree-chevron ${isExpanded ? "expanded" : ""}">
                chevron_right
            </span>

            <span class="subetapa-code">${sub.displayCode}</span>
            <span class="subetapa-name">${sub.name}</span>

            <div class="tree-row-actions">

                <button class="tree-icon-btn" data-action="edit-sub" aria-label="Editar subetapa">
                    <span class="material-symbols-outlined">edit</span>
                </button>

                <button class="tree-icon-btn tree-icon-btn--danger" data-action="delete-sub" aria-label="Excluir subetapa">
                    <span class="material-symbols-outlined">delete</span>
                </button>

            </div>

        </div>

        <div class="atividade-list ${isExpanded ? "expanded" : ""}" id="atividades-${sub.id}"></div>

    `;

    block.querySelector(".subetapa-header").addEventListener("click", (event) => {

        if (event.target.closest(".tree-row-actions")) return;

        toggleSubetapa(sub.id);

    });

    block.querySelector('[data-action="edit-sub"]').addEventListener("click", () => editSubetapa(etapa.id, sub.id));
    block.querySelector('[data-action="delete-sub"]').addEventListener("click", () => deleteSubetapa(etapa.id, sub.id));

    const atividadesContainer = block.querySelector(`#atividades-${sub.id}`);

    sub.atividades.forEach((atividade) => {
        atividadesContainer.appendChild(renderAtividadeRow(etapa.id, sub.id, atividade));
    });

    const addAtvBtn = document.createElement("button");
    addAtvBtn.className = "add-item-btn tree-add-btn";
    addAtvBtn.type = "button";
    addAtvBtn.textContent = "+ Nova atividade";
    addAtvBtn.addEventListener("click", () => addAtividade(etapa.id, sub.id));

    atividadesContainer.appendChild(addAtvBtn);

    return block;

}

function renderAtividadeBadges(atividade) {

    const badges = [];

    if (atividade.finalizada) {
        badges.push(`<span class="tree-status-badge tree-status-badge--done">Concluída</span>`);
    }

    if (atividade.prazo_dias) {
        badges.push(`<span class="tree-prazo-badge">${atividade.prazo_dias} dias</span>`);
    }

    if (atividade.quantidade_total) {
        badges.push(`<span class="tree-prazo-badge">${atividade.quantidade_total} ${atividade.unidade}</span>`);
    }

    return badges.join("");

}

function renderAtividadeRow(etapaId, subId, atividade) {

    const row = document.createElement("div");

    row.className = "atividade-row";

    row.innerHTML = `

        <span class="atividade-name">${atividade.name}</span>

        ${renderAtividadeBadges(atividade)}

        <div class="tree-row-actions">

            <button
                class="tree-icon-btn ${atividade.finalizada ? "tree-icon-btn--active" : ""}"
                data-action="toggle-finalizada"
                aria-label="Marcar como concluída"
                title="Marcar como concluída"
            >
                <span class="material-symbols-outlined">
                    ${atividade.finalizada ? "check_circle" : "radio_button_unchecked"}
                </span>
            </button>

            <button class="tree-icon-btn" data-action="edit-atv" aria-label="Editar atividade">
                <span class="material-symbols-outlined">edit</span>
            </button>

            <button class="tree-icon-btn tree-icon-btn--danger" data-action="delete-atv" aria-label="Excluir atividade">
                <span class="material-symbols-outlined">delete</span>
            </button>

        </div>

    `;

    row.querySelector('[data-action="toggle-finalizada"]').addEventListener("click", () => toggleFinalizada(atividade.id));
    row.querySelector('[data-action="edit-atv"]').addEventListener("click", () => editAtividade(etapaId, subId, atividade.id));
    row.querySelector('[data-action="delete-atv"]').addEventListener("click", () => deleteAtividade(atividade.id));

    return row;

}

/* ==========================================================
   EXPANDIR / RECOLHER
========================================================== */

function toggleEtapa(etapaId) {

    if (expandedEtapas.has(etapaId)) {
        expandedEtapas.delete(etapaId);
    } else {
        expandedEtapas.add(etapaId);
    }

    renderEstrutura();

}

function toggleSubetapa(subId) {

    if (expandedSubetapas.has(subId)) {
        expandedSubetapas.delete(subId);
    } else {
        expandedSubetapas.add(subId);
    }

    renderEstrutura();

}

/* ==========================================================
   PRAZO E QUANTIDADE (opcionais)
========================================================== */

function promptPrazoDias(currentValue) {

    const input = prompt(
        "Prazo estimado em dias para concluir (opcional — deixe vazio para não definir):",
        currentValue != null ? String(currentValue) : ""
    );

    if (input === null) return currentValue ?? null;

    const trimmed = input.trim();

    if (trimmed === "") return null;

    const number = Number(trimmed);

    if (!Number.isFinite(number) || number <= 0) return null;

    return Math.round(number);

}

function promptQuantidade(currentTotal, currentUnidade) {

    const totalInput = prompt(
        "Quantidade total a ser realizada (opcional — deixe vazio para não definir):",
        currentTotal != null ? String(currentTotal) : ""
    );

    if (totalInput === null) {
        return { quantidadeTotal: currentTotal ?? null, unidade: currentUnidade ?? null };
    }

    const trimmedTotal = totalInput.trim();

    if (trimmedTotal === "") {
        return { quantidadeTotal: null, unidade: null };
    }

    const total = Number(trimmedTotal);

    if (!Number.isFinite(total) || total <= 0) {
        return { quantidadeTotal: currentTotal ?? null, unidade: currentUnidade ?? null };
    }

    const unidadeInput = prompt("Unidade de medida (ex: m², un, kg):", currentUnidade || "");

    const unidade = unidadeInput && unidadeInput.trim() ? unidadeInput.trim() : "un";

    return { quantidadeTotal: Math.round(total * 100) / 100, unidade };

}

/* ==========================================================
   ETAPAS — CRIAR / EDITAR / EXCLUIR
========================================================== */

async function addEtapa() {

    const name = prompt("Nome da nova etapa:");
    if (!name || !name.trim()) return;

    const prazoDias = promptPrazoDias(null);

    try {

        const nova = await apiFetch(`/obras/${obraId}/etapas`, {
            method: "POST",
            body: JSON.stringify({ name: name.trim(), prazoDias })
        });

        expandedEtapas.add(nova.id);

        showToast("Etapa adicionada.");

        await loadEstrutura();

    } catch (error) {
        showToast(error.message);
    }

}

async function editEtapa(etapaId) {

    const etapa = estrutura.etapas.find((e) => e.id === etapaId);

    const newName = prompt("Renomear etapa:", etapa.name);
    if (!newName || !newName.trim()) return;

    const prazoDias = promptPrazoDias(etapa.prazo_dias);

    try {

        await apiFetch(`/etapas/${etapaId}`, {
            method: "PUT",
            body: JSON.stringify({ name: newName.trim(), prazoDias })
        });

        showToast("Etapa atualizada.");

        await loadEstrutura();

    } catch (error) {
        showToast(error.message);
    }

}

async function deleteEtapa(etapaId) {

    const etapa = estrutura.etapas.find((e) => e.id === etapaId);

    const confirmed = confirm(
        `Excluir a etapa "${etapa.name}"? Todas as subetapas e atividades dentro dela também serão excluídas.`
    );

    if (!confirmed) return;

    try {

        await apiFetch(`/etapas/${etapaId}`, { method: "DELETE" });

        showToast("Etapa excluída.");

        await loadEstrutura();

    } catch (error) {
        showToast(error.message);
    }

}

/* ==========================================================
   SUBETAPAS — CRIAR / EDITAR / EXCLUIR
========================================================== */

async function addSubetapa(etapaId) {

    const name = prompt("Nome da nova subetapa:");
    if (!name || !name.trim()) return;

    try {

        const nova = await apiFetch(`/etapas/${etapaId}/subetapas`, {
            method: "POST",
            body: JSON.stringify({ name: name.trim() })
        });

        expandedEtapas.add(etapaId);
        expandedSubetapas.add(nova.id);

        showToast("Subetapa adicionada.");

        await loadEstrutura();

    } catch (error) {
        showToast(error.message);
    }

}

async function editSubetapa(etapaId, subId) {

    const etapa = estrutura.etapas.find((e) => e.id === etapaId);
    const sub = etapa.subetapas.find((s) => s.id === subId);

    const newName = prompt("Renomear subetapa:", sub.name);
    if (!newName || !newName.trim()) return;

    try {

        await apiFetch(`/subetapas/${subId}`, {
            method: "PUT",
            body: JSON.stringify({ name: newName.trim() })
        });

        showToast("Subetapa atualizada.");

        await loadEstrutura();

    } catch (error) {
        showToast(error.message);
    }

}

async function deleteSubetapa(etapaId, subId) {

    const etapa = estrutura.etapas.find((e) => e.id === etapaId);
    const sub = etapa.subetapas.find((s) => s.id === subId);

    const confirmed = confirm(
        `Excluir a subetapa "${sub.name}"? Todas as atividades dentro dela também serão excluídas.`
    );

    if (!confirmed) return;

    try {

        await apiFetch(`/subetapas/${subId}`, { method: "DELETE" });

        showToast("Subetapa excluída.");

        await loadEstrutura();

    } catch (error) {
        showToast(error.message);
    }

}

/* ==========================================================
   ATIVIDADES — CRIAR / EDITAR / EXCLUIR / FINALIZAR
========================================================== */

async function addAtividade(etapaId, subId) {

    const name = prompt("Nome da nova atividade:");
    if (!name || !name.trim()) return;

    const prazoDias = promptPrazoDias(null);
    const { quantidadeTotal, unidade } = promptQuantidade(null, null);

    try {

        await apiFetch(`/subetapas/${subId}/atividades`, {
            method: "POST",
            body: JSON.stringify({ name: name.trim(), prazoDias, quantidadeTotal, unidade })
        });

        expandedEtapas.add(etapaId);
        expandedSubetapas.add(subId);

        showToast("Atividade adicionada.");

        await loadEstrutura();

    } catch (error) {
        showToast(error.message);
    }

}

async function editAtividade(etapaId, subId, atvId) {

    const etapa = estrutura.etapas.find((e) => e.id === etapaId);
    const sub = etapa.subetapas.find((s) => s.id === subId);
    const atividade = sub.atividades.find((a) => a.id === atvId);

    const newName = prompt("Renomear atividade:", atividade.name);
    if (!newName || !newName.trim()) return;

    const prazoDias = promptPrazoDias(atividade.prazo_dias);
    const { quantidadeTotal, unidade } = promptQuantidade(atividade.quantidade_total, atividade.unidade);

    try {

        await apiFetch(`/atividades/${atvId}`, {
            method: "PUT",
            body: JSON.stringify({ name: newName.trim(), prazoDias, quantidadeTotal, unidade })
        });

        showToast("Atividade atualizada.");

        await loadEstrutura();

    } catch (error) {
        showToast(error.message);
    }

}

async function toggleFinalizada(atvId) {

    let atividadeAtual = null;

    for (const etapa of estrutura.etapas) {
        for (const sub of etapa.subetapas) {
            const found = sub.atividades.find((a) => a.id === atvId);
            if (found) atividadeAtual = found;
        }
    }

    const novoValor = !atividadeAtual.finalizada;

    try {

        await apiFetch(`/atividades/${atvId}`, {
            method: "PUT",
            body: JSON.stringify({ finalizada: novoValor })
        });

        showToast(novoValor ? "Atividade marcada como concluída." : "Atividade reaberta.");

        await loadEstrutura();

    } catch (error) {
        showToast(error.message);
    }

}

async function deleteAtividade(atvId) {

    const confirmed = confirm("Excluir esta atividade?");

    if (!confirmed) return;

    try {

        await apiFetch(`/atividades/${atvId}`, { method: "DELETE" });

        showToast("Atividade excluída.");

        await loadEstrutura();

    } catch (error) {
        showToast(error.message);
    }

}

/* ==========================================================
   AVISO (TOAST)
========================================================== */

let toastTimeout = null;

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("visible");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("visible");
    }, 2500);

}

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    requireLogin();

    loadEstrutura();

    document.getElementById("add-etapa-btn").addEventListener("click", addEtapa);

    document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = `obra.html?id=${obraId}`;
    });

});
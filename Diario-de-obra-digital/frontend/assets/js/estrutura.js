/* ==========================================================
   BUILDTRACK
   Arquivo: estrutura.js
   Descrição: Lógica da página Estrutura da Obra (EAP)
========================================================== */

/* ==========================================================
   CONTEXTO DA OBRA
========================================================== */

function getObraIdFromURL() {

    const params = new URLSearchParams(window.location.search);

    return Number(params.get("id")) || 1;

}

const obraId = getObraIdFromURL();

/* ==========================================================
   DADOS FICTÍCIOS (futuramente virão do backend)
   Cada obra tem sua própria estrutura — nunca compartilhada.
   Chave: obraId.
========================================================== */

let nextEtapaId = 3;
let nextSubetapaId = 3;
let nextAtividadeId = 7;

const estruturasPorObra = {

    1: {
        obraName: "Casa Jardim",
        etapas: [
            {
                id: 1,
                name: "Estruturas",
                prazoDias: 25,
                subetapas: [
                    {
                        id: 1,
                        name: "Vigas e Lajes",
                        atividades: [
                            { id: 1, name: "Execução de formas", prazoDias: 8, quantidadeTotal: 120, unidade: "m²", finalizada: false },
                            { id: 2, name: "Montagem de armaduras", prazoDias: 5, quantidadeTotal: null, unidade: null, finalizada: false },
                            { id: 3, name: "Concretagem", prazoDias: null, quantidadeTotal: null, unidade: null, finalizada: false }
                        ]
                    },
                    {
                        id: 2,
                        name: "Fundações",
                        atividades: [
                            { id: 4, name: "Escavação", prazoDias: null, quantidadeTotal: null, unidade: null, finalizada: true },
                            { id: 5, name: "Montagem de armaduras", prazoDias: null, quantidadeTotal: null, unidade: null, finalizada: false },
                            { id: 6, name: "Concretagem", prazoDias: null, quantidadeTotal: null, unidade: null, finalizada: false }
                        ]
                    }
                ]
            },
            {
                id: 2,
                name: "Alvenaria",
                prazoDias: null,
                subetapas: []
            }
        ]
    }

};

/* Se a obra ainda não tem estrutura cadastrada, começa vazia */

if (!estruturasPorObra[obraId]) {
    estruturasPorObra[obraId] = { obraName: "Obra", etapas: [] };
}

const estrutura = estruturasPorObra[obraId];

/* ==========================================================
   ESTADO DE EXPANSÃO (o que está aberto/fechado na árvore)
========================================================== */

const expandedEtapas = new Set();
const expandedSubetapas = new Set();

/* ==========================================================
   RECALCULAR CÓDIGOS (01, 01.1, 01.2...)
   Sempre calculado na hora de exibir — assim nunca fica com
   "buraco" na numeração depois de excluir algo do meio.
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

            ${etapa.prazoDias ? `<span class="tree-prazo-badge">${etapa.prazoDias} dias</span>` : ""}

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

    if (atividade.prazoDias) {
        badges.push(`<span class="tree-prazo-badge">${atividade.prazoDias} dias</span>`);
    }

    if (atividade.quantidadeTotal) {
        badges.push(`<span class="tree-prazo-badge">${atividade.quantidadeTotal} ${atividade.unidade}</span>`);
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

    row.querySelector('[data-action="toggle-finalizada"]').addEventListener("click", () => toggleFinalizada(etapaId, subId, atividade.id));
    row.querySelector('[data-action="edit-atv"]').addEventListener("click", () => editAtividade(etapaId, subId, atividade.id));
    row.querySelector('[data-action="delete-atv"]').addEventListener("click", () => deleteAtividade(etapaId, subId, atividade.id));

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
   PRAZO ESTIMADO (opcional, em dias)
   Se o usuário cancelar o prompt, mantém o valor atual.
   Se confirmar vazio, remove o prazo (null).
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

/* ==========================================================
   QUANTIDADE TOTAL (opcional) — ex: "120 m²"
   Mesma lógica do prazo: cancelar mantém o valor atual,
   confirmar vazio remove a quantidade.
========================================================== */

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

function addEtapa() {

    const name = prompt("Nome da nova etapa:");

    if (!name || !name.trim()) return;

    const prazoDias = promptPrazoDias(null);

    const newEtapa = { id: nextEtapaId++, name: name.trim(), prazoDias, subetapas: [] };

    estrutura.etapas.push(newEtapa);

    expandedEtapas.add(newEtapa.id);

    renderEstrutura();

    showToast("Etapa adicionada.");

}

function editEtapa(etapaId) {

    const etapa = estrutura.etapas.find((e) => e.id === etapaId);

    const newName = prompt("Renomear etapa:", etapa.name);

    if (!newName || !newName.trim()) return;

    etapa.name = newName.trim();
    etapa.prazoDias = promptPrazoDias(etapa.prazoDias);

    renderEstrutura();

    showToast("Etapa atualizada.");

}

function deleteEtapa(etapaId) {

    const etapa = estrutura.etapas.find((e) => e.id === etapaId);

    const confirmed = confirm(
        `Excluir a etapa "${etapa.name}"? Todas as subetapas e atividades dentro dela também serão excluídas.`
    );

    if (!confirmed) return;

    estrutura.etapas = estrutura.etapas.filter((e) => e.id !== etapaId);

    renderEstrutura();

    showToast("Etapa excluída.");

}

/* ==========================================================
   SUBETAPAS — CRIAR / EDITAR / EXCLUIR
========================================================== */

function addSubetapa(etapaId) {

    const name = prompt("Nome da nova subetapa:");

    if (!name || !name.trim()) return;

    const etapa = estrutura.etapas.find((e) => e.id === etapaId);

    const newSub = { id: nextSubetapaId++, name: name.trim(), atividades: [] };

    etapa.subetapas.push(newSub);

    expandedEtapas.add(etapaId);
    expandedSubetapas.add(newSub.id);

    renderEstrutura();

    showToast("Subetapa adicionada.");

}

function editSubetapa(etapaId, subId) {

    const etapa = estrutura.etapas.find((e) => e.id === etapaId);
    const sub = etapa.subetapas.find((s) => s.id === subId);

    const newName = prompt("Renomear subetapa:", sub.name);

    if (!newName || !newName.trim()) return;

    sub.name = newName.trim();

    renderEstrutura();

    showToast("Subetapa atualizada.");

}

function deleteSubetapa(etapaId, subId) {

    const etapa = estrutura.etapas.find((e) => e.id === etapaId);
    const sub = etapa.subetapas.find((s) => s.id === subId);

    const confirmed = confirm(
        `Excluir a subetapa "${sub.name}"? Todas as atividades dentro dela também serão excluídas.`
    );

    if (!confirmed) return;

    etapa.subetapas = etapa.subetapas.filter((s) => s.id !== subId);

    renderEstrutura();

    showToast("Subetapa excluída.");

}

/* ==========================================================
   ATIVIDADES — CRIAR / EDITAR / EXCLUIR
========================================================== */

function addAtividade(etapaId, subId) {

    const name = prompt("Nome da nova atividade:");

    if (!name || !name.trim()) return;

    const prazoDias = promptPrazoDias(null);
    const { quantidadeTotal, unidade } = promptQuantidade(null, null);

    const etapa = estrutura.etapas.find((e) => e.id === etapaId);
    const sub = etapa.subetapas.find((s) => s.id === subId);

    sub.atividades.push({
        id: nextAtividadeId++,
        name: name.trim(),
        prazoDias,
        quantidadeTotal,
        unidade,
        finalizada: false
    });

    expandedEtapas.add(etapaId);
    expandedSubetapas.add(subId);

    renderEstrutura();

    showToast("Atividade adicionada.");

}

function editAtividade(etapaId, subId, atvId) {

    const etapa = estrutura.etapas.find((e) => e.id === etapaId);
    const sub = etapa.subetapas.find((s) => s.id === subId);
    const atividade = sub.atividades.find((a) => a.id === atvId);

    const newName = prompt("Renomear atividade:", atividade.name);

    if (!newName || !newName.trim()) return;

    atividade.name = newName.trim();
    atividade.prazoDias = promptPrazoDias(atividade.prazoDias);

    const quantidade = promptQuantidade(atividade.quantidadeTotal, atividade.unidade);
    atividade.quantidadeTotal = quantidade.quantidadeTotal;
    atividade.unidade = quantidade.unidade;

    renderEstrutura();

    showToast("Atividade atualizada.");

}

function toggleFinalizada(etapaId, subId, atvId) {

    const etapa = estrutura.etapas.find((e) => e.id === etapaId);
    const sub = etapa.subetapas.find((s) => s.id === subId);
    const atividade = sub.atividades.find((a) => a.id === atvId);

    atividade.finalizada = !atividade.finalizada;

    renderEstrutura();

    showToast(atividade.finalizada
        ? "Atividade marcada como concluída."
        : "Atividade reaberta.");

}

function deleteAtividade(etapaId, subId, atvId) {

    const etapa = estrutura.etapas.find((e) => e.id === etapaId);
    const sub = etapa.subetapas.find((s) => s.id === subId);

    const confirmed = confirm("Excluir esta atividade?");

    if (!confirmed) return;

    sub.atividades = sub.atividades.filter((a) => a.id !== atvId);

    renderEstrutura();

    showToast("Atividade excluída.");

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

    document.getElementById("obra-name-subtitle").textContent =
        `${estrutura.obraName} — organize etapas, subetapas e atividades.`;

    renderEstrutura();

    document.getElementById("add-etapa-btn").addEventListener("click", addEtapa);

    document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = `obra.html?id=${obraId}`;
    });

});
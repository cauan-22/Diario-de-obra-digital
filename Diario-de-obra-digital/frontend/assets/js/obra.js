/* ==========================================================
   BUILDTRACK
   Arquivo: obra.js
   Descrição: Lógica da página de Detalhes da Obra
========================================================== */

/* Texto exibido para cada status */

const statusLabels = {
    ativa: "Ativa",
    pausada: "Pausada",
    concluida: "Concluída"
};

/* ==========================================================
   ID DA OBRA NA URL (ex: obra.html?id=1)
========================================================== */

function getObraIdFromURL() {

    const params = new URLSearchParams(window.location.search);

    return Number(params.get("id"));

}

/* ==========================================================
   FORMATAÇÃO DE DATA
   O backend manda a data em formato ISO (ex: "2026-08-20").
========================================================== */

function formatDateBR(isoDate) {

    if (!isoDate) return "—";

    const date = new Date(isoDate);

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;

}

function formatDateShort(isoDate) {

    if (!isoDate) return "--";

    const date = new Date(isoDate);

    const months = [
        "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
        "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
    ];

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    return `${day} ${month} ${year}`;

}

/* ==========================================================
   RENDERIZAÇÃO DA IDENTIFICAÇÃO E INFORMAÇÕES
========================================================== */

function renderObraHeader(obra) {

    document.getElementById("obra-number").textContent = String(obra.id).padStart(2, "0");

    document.getElementById("obra-name").textContent = obra.name;

    document.getElementById("obra-location").textContent = `${obra.city} / ${obra.state}`;

    const statusEl = document.getElementById("obra-status");

    statusEl.className = `obra-status status-${obra.status}`;

    document.getElementById("obra-status-text").textContent =
        statusLabels[obra.status];

    document.title = `${obra.name} | BuildTrack`;

}

function renderObraInfo(obra) {

    document.getElementById("info-client").textContent = obra.client;

    document.getElementById("info-contract").textContent = obra.contract || "—";

    document.getElementById("info-responsible").textContent = obra.responsible;

    document.getElementById("info-crea").textContent =
        obra.registration_type ? `${obra.registration_type} ${obra.registration_number}` : (obra.registration_number || "—");

    document.getElementById("info-start").textContent = formatDateBR(obra.start_date);

}

/* ==========================================================
   RESUMO RÁPIDO
========================================================== */

function renderQuickSummary(rdos) {

    document.getElementById("quick-rdos").textContent = rdos.length;

    const lastRDO = rdos[0];

    document.getElementById("quick-last").textContent =
        lastRDO ? formatDateShort(lastRDO.date) : "Nenhum RDO ainda";

}

/* ==========================================================
   HISTÓRICO DE RDOs
========================================================== */

function renderRDOList(obraId, rdos) {

    const list = document.getElementById("rdo-list");

    list.innerHTML = "";

    if (rdos.length === 0) {

        list.innerHTML = `<p class="rdo-hint">Nenhum RDO registrado ainda. Toque em "+ Novo RDO" para começar.</p>`;

        return;

    }

    rdos.forEach((rdo) => {

        const row = document.createElement("article");

        row.className = "rdo-row fade-in";

        row.dataset.id = rdo.id;

        const rdoNumber = String(rdo.rdoNumber).padStart(3, "0");

        const occurrenceText = rdo.occurrences > 0
            ? `${rdo.occurrences} ocorrência${rdo.occurrences > 1 ? "s" : ""}`
            : "Sem ocorrências";

        const occurrenceClass = rdo.occurrences > 0 ? "has-occurrence" : "";

        row.innerHTML = `

            <div class="rdo-row-main">

                <span class="rdo-row-date">${formatDateShort(rdo.date)}</span>

                <h3 class="rdo-row-title">RDO ${rdoNumber}</h3>

                <div class="rdo-row-stats">
                    <span>${rdo.workers} trabalhadores</span>
                    <span>${rdo.activities} atividades</span>
                    <span class="${occurrenceClass}">${occurrenceText}</span>
                </div>

            </div>

            <span class="rdo-row-open">
                Abrir
                <span class="material-symbols-outlined">arrow_forward</span>
            </span>

        `;

        row.addEventListener("click", () => openRDO(obraId, rdo.id));

        list.appendChild(row);

    });

}

/* ==========================================================
   AVISO (TOAST)
========================================================== */

let toastTimeout = null;

function showToast(message) {

    const toast = document.getElementById("obra-toast");

    toast.textContent = message;
    toast.classList.add("visible");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("visible");
    }, 3000);

}

/* ==========================================================
   CARREGAR DADOS DO BACKEND
========================================================== */

async function loadObra(obraId) {

    try {

        const [obra, rdos] = await Promise.all([
            apiFetch(`/obras/${obraId}`),
            apiFetch(`/obras/${obraId}/rdos`)
        ]);

        renderObraHeader(obra);
        renderObraInfo(obra);
        renderQuickSummary(rdos);
        renderRDOList(obraId, rdos);

        setupActions(obra);

    } catch (error) {

        showToast(`Não foi possível carregar a obra: ${error.message}`);

        setTimeout(() => {
            window.location.href = "home.html";
        }, 2000);

    }

}

/* ==========================================================
   AÇÕES
========================================================== */

function openRDO(obraId, rdoId) {

    window.location.href = `rdo-detalhes.html?obra=${obraId}&rdo=${rdoId}`;

}

function handleNewRDO(obraId) {

    window.location.href = `rdo.html?obraId=${obraId}`;

}

function handleBack() {

    // A Obra é sempre acessada a partir da Home, então "Voltar"
    // deve ir sempre para lá — usar o histórico do navegador
    // (history.back()) causava travamento depois de passar por
    // várias páginas (Home -> Obra -> RDO -> Obra).

    window.location.href = "home.html";

}

function setupActions(obra) {

    document
        .getElementById("new-rdo-btn")
        .addEventListener("click", () => handleNewRDO(obra.id));

    document
        .getElementById("link-estrutura")
        .addEventListener("click", () => {
            window.location.href = `estrutura.html?id=${obra.id}`;
        });

    document
        .getElementById("link-equipe")
        .addEventListener("click", () => {
            window.location.href = `equipe.html?id=${obra.id}`;
        });

    document
        .getElementById("link-terceirizados")
        .addEventListener("click", () => {
            window.location.href = `terceirizados.html?id=${obra.id}`;
        });

    document
        .getElementById("link-equipamentos")
        .addEventListener("click", () => {
            window.location.href = `equipamentos.html?id=${obra.id}`;
        });

}

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    requireLogin();

    const obraId = getObraIdFromURL();

    if (!obraId) {
        window.location.href = "home.html";
        return;
    }

    document.getElementById("obra-back-btn").addEventListener("click", handleBack);

    loadObra(obraId);

});
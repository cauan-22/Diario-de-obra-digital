/* ==========================================================
   BUILDTRACK
   Arquivo: obra.js
   Descrição: Lógica da página de Detalhes da Obra
========================================================== */

/* ==========================================================
   DADOS FICTÍCIOS (futuramente virão do backend)
   Organizados por ID para simular uma busca real.
========================================================== */

const obrasDatabase = {

    1: {
        id: 1,
        number: "01",
        name: "Casa Jardim",
        city: "Porto Belo / SC",
        status: "ativa",
        client: "João Silva",
        contract: "CT-2026-014",
        responsible: "Eng. Carlos Mendes",
        crea: "CREA/SC 123456",
        startDate: "05/08/2026",
        rdos: [
            { id: 12, date: "20 AGO 2026", workers: 5, activities: 3, occurrences: 1 },
            { id: 11, date: "19 AGO 2026", workers: 6, activities: 4, occurrences: 0 },
            { id: 10, date: "18 AGO 2026", workers: 4, activities: 2, occurrences: 0 }
        ]
    }

};

/* Texto exibido para cada status */

const statusLabels = {
    ativa: "Ativa",
    pausada: "Pausada",
    concluida: "Concluída"
};

/* ==========================================================
   BUSCAR OBRA PELO ID DA URL
   Ex: obra.html?id=1
   Futuramente esta função fará uma chamada ao backend.
========================================================== */

function getObraFromURL() {

    const params = new URLSearchParams(window.location.search);

    const id = Number(params.get("id")) || 1;

    return obrasDatabase[id] || obrasDatabase[1];

}

/* ==========================================================
   RENDERIZAÇÃO DA IDENTIFICAÇÃO E INFORMAÇÕES
========================================================== */

function renderObraHeader(obra) {

    document.getElementById("obra-number").textContent = obra.number;

    document.getElementById("obra-name").textContent = obra.name;

    document.getElementById("obra-location").textContent = obra.city;

    const statusEl = document.getElementById("obra-status");

    statusEl.className = `obra-status status-${obra.status}`;

    document.getElementById("obra-status-text").textContent =
        statusLabels[obra.status];

}

function renderObraInfo(obra) {

    document.getElementById("info-client").textContent = obra.client;

    document.getElementById("info-contract").textContent = obra.contract;

    document.getElementById("info-responsible").textContent = obra.responsible;

    document.getElementById("info-crea").textContent = obra.crea;

    document.getElementById("info-start").textContent = obra.startDate;

}

/* ==========================================================
   RESUMO RÁPIDO
========================================================== */

function renderQuickSummary(obra) {

    const total = obra.rdos.length;

    const lastRDO = obra.rdos[0];

    document.getElementById("quick-rdos").textContent = total;

    document.getElementById("quick-last").textContent =
        lastRDO ? lastRDO.date : "--";

}

/* ==========================================================
   HISTÓRICO DE RDOs
========================================================== */

function renderRDOList(obra) {

    const list = document.getElementById("rdo-list");

    list.innerHTML = "";

    obra.rdos.forEach((rdo) => {

        const row = document.createElement("article");

        row.className = "rdo-row fade-in";

        row.dataset.id = rdo.id;

        const rdoNumber = String(rdo.id).padStart(3, "0");

        const occurrenceText = rdo.occurrences > 0
            ? `${rdo.occurrences} ocorrência${rdo.occurrences > 1 ? "s" : ""}`
            : "Sem ocorrências";

        const occurrenceClass = rdo.occurrences > 0 ? "has-occurrence" : "";

        row.innerHTML = `

            <div class="rdo-row-main">

                <span class="rdo-row-date">${rdo.date}</span>

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

        row.addEventListener("click", () => openRDO(rdo.id));

        list.appendChild(row);

    });

}

/* ==========================================================
   AÇÕES
========================================================== */

function openRDO(id) {

    // Futuramente: abrir a página de detalhes do RDO
    // window.location.href = `rdo.html?id=${id}`;

    console.log("Abrir RDO com ID:", id);

}

function handleNewRDO() {

    // Futuramente: abrir o formulário de criação de RDO
    console.log("Criar novo RDO");

}

function handleBack() {

    if (document.referrer) {
        history.back();
        return;
    }

    window.location.href = "home.html";

}

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const obra = getObraFromURL();

    renderObraHeader(obra);

    renderObraInfo(obra);

    renderQuickSummary(obra);

    renderRDOList(obra);

    document
        .getElementById("new-rdo-btn")
        .addEventListener("click", handleNewRDO);

    document
        .getElementById("obra-back-btn")
        .addEventListener("click", handleBack);

});
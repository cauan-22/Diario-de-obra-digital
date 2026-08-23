/* ==========================================================
   BUILDTRACK
   Arquivo: rdos.js
   Descrição: Lógica da página de listagem geral de RDOs
========================================================== */

/* ==========================================================
   DADOS FICTÍCIOS (futuramente virão do backend)
   Já ordenados do mais recente para o mais antigo.
========================================================== */

const allRDOs = [

    { id: 12, obraId: 1, obraName: "Casa Jardim", date: "20 AGO 2026", workers: 9, activities: 3, occurrences: 1 },
    { id: 5, obraId: 2, obraName: "Reforma Escritório", date: "19 AGO 2026", workers: 5, activities: 3, occurrences: 0 },
    { id: 11, obraId: 1, obraName: "Casa Jardim", date: "19 AGO 2026", workers: 6, activities: 4, occurrences: 0 },
    { id: 10, obraId: 1, obraName: "Casa Jardim", date: "18 AGO 2026", workers: 4, activities: 2, occurrences: 0 },
    { id: 4, obraId: 2, obraName: "Reforma Escritório", date: "18 AGO 2026", workers: 5, activities: 2, occurrences: 1 },
    { id: 1, obraId: 3, obraName: "Galpão Industrial", date: "15 AGO 2026", workers: 8, activities: 5, occurrences: 0 }

];

/* ==========================================================
   ESTADO DOS FILTROS
========================================================== */

let searchTerm = "";
let obraFilter = "todas";

/* ==========================================================
   FILTRO POR OBRA — GERADO DINAMICAMENTE
   (evita mostrar um filtro que resultaria em lista vazia)
========================================================== */

function setupObraFilter() {

    const container = document.getElementById("obra-filter");

    const obraNames = [...new Set(allRDOs.map((rdo) => rdo.obraName))];

    const chips = ["todas", ...obraNames];

    container.innerHTML = "";

    chips.forEach((value) => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "chip-option" + (value === "todas" ? " active" : "");
        button.dataset.value = value;
        button.textContent = value === "todas" ? "Todas" : value;

        button.addEventListener("click", () => {

            container.querySelectorAll(".chip-option").forEach((btn) => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            obraFilter = value;

            renderRDOs();

        });

        container.appendChild(button);

    });

}

/* ==========================================================
   FILTRAGEM
========================================================== */

function getFilteredRDOs() {

    const term = searchTerm.trim().toLowerCase();

    return allRDOs.filter((rdo) => {

        const matchesObra = obraFilter === "todas" || rdo.obraName === obraFilter;

        const rdoLabel = `rdo ${String(rdo.id).padStart(3, "0")}`;

        const matchesSearch =
            term === "" ||
            rdo.obraName.toLowerCase().includes(term) ||
            rdo.date.toLowerCase().includes(term) ||
            rdoLabel.includes(term);

        return matchesObra && matchesSearch;

    });

}

/* ==========================================================
   RENDERIZAÇÃO
========================================================== */

function renderRDOs() {

    const list = document.getElementById("rdo-list");
    const emptyState = document.getElementById("empty-state");

    const filtered = getFilteredRDOs();

    list.innerHTML = "";

    document.getElementById("rdos-count").textContent =
        `${filtered.length} registro${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`;

    emptyState.hidden = filtered.length > 0;

    filtered.forEach((rdo) => {

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

                <span class="rdo-row-date">${rdo.obraName} · ${rdo.date}</span>

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

        row.addEventListener("click", () => openRDO(rdo.obraId, rdo.id));

        list.appendChild(row);

    });

}

/* ==========================================================
   AÇÕES
========================================================== */

function openRDO(obraId, rdoId) {

    window.location.href = `rdo-detalhes.html?obra=${obraId}&rdo=${rdoId}`;

}

/* ==========================================================
   BUSCA
========================================================== */

function setupSearch() {

    document.getElementById("search-input").addEventListener("input", (event) => {

        searchTerm = event.target.value;

        renderRDOs();

    });

}

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    setupObraFilter();

    renderRDOs();

    setupSearch();

});
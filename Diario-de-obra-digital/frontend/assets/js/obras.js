/* ==========================================================
   BUILDTRACK
   Arquivo: obras.js
   Descrição: Lógica da página de listagem de Obras
========================================================== */

/* ==========================================================
   DADOS FICTÍCIOS (futuramente virão do backend)
   "code" é o número de identificação da obra — fixo,
   independente de busca ou filtro.
========================================================== */

const allProjects = [

    {
        id: 1,
        code: "01",
        name: "Casa Jardim",
        city: "Porto Belo / SC",
        client: "João Silva",
        status: "ativa",
        lastRDO: "20 AGO 2026"
    },

    {
        id: 2,
        code: "02",
        name: "Reforma Escritório",
        city: "Itajaí / SC",
        client: "Empresa Delta",
        status: "pausada",
        lastRDO: "19 AGO 2026"
    },

    {
        id: 3,
        code: "03",
        name: "Galpão Industrial",
        city: "Balneário Camboriú / SC",
        client: "Metalúrgica Norte",
        status: "ativa",
        lastRDO: "18 AGO 2026"
    },

    {
        id: 4,
        code: "04",
        name: "Edifício Vista Mar",
        city: "Bombinhas / SC",
        client: "Incorporadora Horizonte",
        status: "concluida",
        lastRDO: "02 JUN 2026"
    },

    {
        id: 5,
        code: "05",
        name: "Residencial Bela Vista",
        city: "Porto Belo / SC",
        client: "Cooperativa Habitar",
        status: "ativa",
        lastRDO: "21 AGO 2026"
    }

];

const statusLabels = {
    ativa: "Ativa",
    pausada: "Pausada",
    concluida: "Concluída"
};

/* ==========================================================
   ESTADO DOS FILTROS
========================================================== */

let searchTerm = "";
let statusFilter = "todas";

/* ==========================================================
   FILTRAGEM
========================================================== */

function getFilteredProjects() {

    return allProjects.filter((project) => {

        const matchesStatus =
            statusFilter === "todas" || project.status === statusFilter;

        const term = searchTerm.trim().toLowerCase();

        const matchesSearch =
            term === "" ||
            project.name.toLowerCase().includes(term) ||
            project.city.toLowerCase().includes(term) ||
            project.client.toLowerCase().includes(term);

        return matchesStatus && matchesSearch;

    });

}

/* ==========================================================
   RENDERIZAÇÃO
========================================================== */

function renderProjects() {

    const list = document.getElementById("project-list");
    const emptyState = document.getElementById("empty-state");

    const filtered = getFilteredProjects();

    list.innerHTML = "";

    document.getElementById("obras-count").textContent =
        `${filtered.length} obra${filtered.length !== 1 ? "s" : ""} encontrada${filtered.length !== 1 ? "s" : ""}`;

    emptyState.hidden = filtered.length > 0;

    filtered.forEach((project) => {

        const row = document.createElement("article");

        row.className = `project-row status-${project.status} fade-in`;

        row.dataset.id = project.id;

        row.innerHTML = `

            <span class="project-row-number">${project.code}</span>

            <div class="project-row-main">

                <h3>${project.name}</h3>

                <p class="project-row-location">${project.city}</p>

                <div class="project-row-details">

                    <div>
                        <small>Cliente</small>
                        <strong>${project.client}</strong>
                    </div>

                    <div>
                        <small>Último RDO</small>
                        <strong>${project.lastRDO}</strong>
                    </div>

                </div>

            </div>

            <div class="project-row-status">
                <span class="status-dot"></span>
                <span class="status-text">${statusLabels[project.status]}</span>
            </div>

        `;

        row.addEventListener("click", () => openProject(project.id));

        list.appendChild(row);

    });

}

/* ==========================================================
   AÇÕES
========================================================== */

function openProject(id) {

    window.location.href = `obra.html?id=${id}`;

}

function handleNewProject() {

    window.location.href = "nova-obra.html";

}

/* ==========================================================
   FILTRO POR STATUS (chips)
========================================================== */

function setupStatusFilter() {

    const group = document.getElementById("status-filter");

    group.querySelectorAll(".chip-option").forEach((button) => {

        button.addEventListener("click", () => {

            group.querySelectorAll(".chip-option").forEach((btn) => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            statusFilter = button.dataset.value;

            renderProjects();

        });

    });

}

/* ==========================================================
   BUSCA
========================================================== */

function setupSearch() {

    document.getElementById("search-input").addEventListener("input", (event) => {

        searchTerm = event.target.value;

        renderProjects();

    });

}

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    renderProjects();

    setupStatusFilter();

    setupSearch();

    document
        .getElementById("new-project-btn")
        .addEventListener("click", handleNewProject);

});
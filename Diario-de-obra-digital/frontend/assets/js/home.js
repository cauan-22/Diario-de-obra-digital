/* ==========================================================
   BUILDTRACK
   Arquivo: home.js
   Descrição: Lógica da página Home
========================================================== */

/* ==========================================================
   DADOS FICTÍCIOS (futuramente virão do backend)
   Cada obra possui: id, nome, cidade, cliente, status, lastRDO
========================================================== */

const projectsData = [

    {
        id: 1,
        name: "Casa Jardim",
        city: "Porto Belo / SC",
        client: "João Silva",
        status: "ativa",
        lastRDO: "20 AGO 2026"
    },

    {
        id: 2,
        name: "Reforma Escritório",
        city: "Itajaí / SC",
        client: "Empresa Delta",
        status: "pausada",
        lastRDO: "19 AGO 2026"
    },

    {
        id: 3,
        name: "Galpão Industrial",
        city: "Balneário Camboriú / SC",
        client: "Metalúrgica Norte",
        status: "ativa",
        lastRDO: "18 AGO 2026"
    }

];

/* Texto exibido para cada status */

const statusLabels = {
    ativa: "Ativa",
    pausada: "Pausada",
    concluida: "Concluída"
};

/* ==========================================================
   RENDERIZAÇÃO DA LISTA DE OBRAS
========================================================== */

function renderProjects(projects) {

    const list = document.getElementById("project-list");

    list.innerHTML = "";

    projects.forEach((project, index) => {

        const row = document.createElement("article");

        row.className = `project-row status-${project.status} fade-in`;

        row.dataset.id = project.id;

        const number = String(index + 1).padStart(2, "0");

        row.innerHTML = `

            <span class="project-row-number">${number}</span>

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
   RESUMO (TOTAIS)
========================================================== */

function renderSummary(projects) {

    const total = projects.length;

    const active = projects.filter(p => p.status === "ativa").length;

    document.getElementById("summary-total").textContent =
        String(total).padStart(2, "0");

    document.getElementById("summary-active").textContent =
        String(active).padStart(2, "0");

    // O total de RDOs virá do backend futuramente.
    // Por enquanto mantemos o valor fixo no HTML.

}

/* ==========================================================
   AÇÕES
========================================================== */

function openProject(id) {

    window.location.href = `obra.html?id=${id}`;

}

function handleNewProject() {

    // Futuramente: abrir formulário/página de cadastro de obra
    console.log("Abrir formulário de nova obra");

}

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    renderProjects(projectsData);

    renderSummary(projectsData);

    document
        .getElementById("new-project-btn")
        .addEventListener("click", handleNewProject);

});
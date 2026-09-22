/* ==========================================================
   BUILDTRACK
   Arquivo: home.js
   Descrição: Lógica da página Home
========================================================== */

/* Texto exibido para cada status */

const statusLabels = {
    ativa: "Ativa",
    pausada: "Pausada",
    concluida: "Concluída"
};

/* ==========================================================
   FORMATAÇÃO DE DATA
   O backend manda a data em formato ISO (ex: "2026-08-20").
========================================================== */

function formatDateShort(isoDate) {

    if (!isoDate) return "Nenhum RDO ainda";

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
   RENDERIZAÇÃO DA LISTA DE OBRAS
========================================================== */

function renderProjects(projects) {

    const list = document.getElementById("project-list");

    list.innerHTML = "";

    if (projects.length === 0) {

        list.innerHTML = `<p class="rdo-hint">Nenhuma obra cadastrada ainda. Toque em "+ Nova obra" para começar.</p>`;

        return;

    }

    projects.forEach((project, index) => {

        const row = document.createElement("article");

        row.className = `project-row status-${project.status} fade-in`;

        row.dataset.id = project.id;

        const number = String(index + 1).padStart(2, "0");

        row.innerHTML = `

            <span class="project-row-number">${number}</span>

            <div class="project-row-main">

                <h3>${project.name}</h3>

                <p class="project-row-location">${project.city} / ${project.state}</p>

                <div class="project-row-details">

                    <div>
                        <small>Cliente</small>
                        <strong>${project.client}</strong>
                    </div>

                    <div>
                        <small>Último RDO</small>
                        <strong>${formatDateShort(project.last_rdo_date)}</strong>
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

    const active = projects.filter((p) => p.status === "ativa").length;

    const totalRDOs = projects.reduce((sum, p) => sum + Number(p.rdo_count || 0), 0);

    document.getElementById("summary-total").textContent = String(total).padStart(2, "0");
    document.getElementById("summary-active").textContent = String(active).padStart(2, "0");
    document.getElementById("summary-rdos").textContent = String(totalRDOs).padStart(2, "0");

}

/* ==========================================================
   CARREGAR OBRAS DO BACKEND
========================================================== */

async function loadProjects() {

    const list = document.getElementById("project-list");

    try {

        const projects = await apiFetch("/obras");

        renderProjects(projects);
        renderSummary(projects);

    } catch (error) {

        list.innerHTML = `<p class="rdo-hint">Não foi possível carregar as obras: ${error.message}</p>`;

    }

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
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    requireLogin();

    // O nome vem do que foi salvo no login.js após autenticar —
    // sem isso, a saudação sempre mostrava "Cauan" fixo, não
    // importa quem estivesse logado.
    const user = getStoredUser();

    if (user) {
        document.querySelector(".home-greeting-name").textContent = user.name.split(" ")[0];
    }

    loadProjects();

    document
        .getElementById("new-project-btn")
        .addEventListener("click", handleNewProject);

});
/* ==========================================================
   BUILDTRACK
   Arquivo: components.js
   Descrição: Componentes reutilizáveis
========================================================== */

const Components = {

    // ======================================================
    // CARD DE OBRA
    // ======================================================

    createProjectCard(project) {

        const card = document.createElement("article");

        card.className = "project-card";

        card.innerHTML = `

            <div class="project-top">

                <div>

                    <h3>${project.name}</h3>

                    <p class="project-location">

                        <span class="material-symbols-outlined">

                            location_on

                        </span>

                        ${project.city}

                    </p>

                </div>

                <span class="badge ${project.status.class}">

                    ${project.status.text}

                </span>

            </div>

            <div class="project-info">

                <div>

                    <small>Cliente</small>

                    <strong>${project.client}</strong>

                </div>

                <div>

                    <small>Registros</small>

                    <strong>${project.records}</strong>

                </div>

            </div>

            <div class="project-footer">

                <span>

                    Atualizado ${project.update}

                </span>

                <button
                    class="card-button"
                    data-id="${project.id}"
                >

                    Abrir

                    <span class="material-symbols-outlined">

                        arrow_forward

                    </span>

                </button>

            </div>

        `;

        return card;

    },

    // ======================================================
    // BADGE
    // ======================================================

    createBadge(text, className) {

        const badge = document.createElement("span");

        badge.className = `badge ${className}`;

        badge.textContent = text;

        return badge;

    },

    // ======================================================
    // BOTÃO PADRÃO
    // ======================================================

    createButton(text, className = "btn") {

        const button = document.createElement("button");

        button.className = className;

        button.textContent = text;

        return button;

    }

};
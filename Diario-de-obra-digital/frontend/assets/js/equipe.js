/* ==========================================================
   BUILDTRACK
   Arquivo: equipe.js
   Descrição: Lógica da página Equipe da Obra (funcionários próprios)
========================================================== */

function getObraIdFromURL() {

    const params = new URLSearchParams(window.location.search);

    return Number(params.get("id"));

}

const obraId = getObraIdFromURL();

let funcionarios = [];

/* ==========================================================
   RENDERIZAÇÃO
========================================================== */

function renderEquipe() {

    const list = document.getElementById("funcionarios-list");
    const emptyState = document.getElementById("empty-state");

    list.innerHTML = "";

    emptyState.hidden = funcionarios.length > 0;

    funcionarios.forEach((funcionario) => {

        const row = document.createElement("div");

        row.className = "simple-list-row";

        const statusBadge = funcionario.status === "ativo"
            ? ""
            : `<span class="tree-status-badge tree-status-badge--inativo">Inativo</span>`;

        const matriculaBadge = funcionario.matricula
            ? `<span class="tree-prazo-badge">Mat. ${funcionario.matricula}</span>`
            : "";

        row.innerHTML = `

            <div class="simple-list-row-main">

                <div class="simple-list-row-name">${funcionario.name}</div>
                <div class="simple-list-row-sub">${funcionario.funcao}</div>

                ${funcionario.observacao ? `<div class="simple-list-row-sub">${funcionario.observacao}</div>` : ""}

                <div class="simple-list-row-badges">
                    ${statusBadge}
                    ${matriculaBadge}
                </div>

            </div>

            <div class="tree-row-actions">

                <button
                    class="tree-icon-btn ${funcionario.status === "ativo" ? "tree-icon-btn--active" : ""}"
                    data-action="toggle-status"
                    title="${funcionario.status === "ativo" ? "Marcar como inativo" : "Marcar como ativo"}"
                >
                    <span class="material-symbols-outlined">
                        ${funcionario.status === "ativo" ? "person" : "person_off"}
                    </span>
                </button>

                <button class="tree-icon-btn" data-action="edit" aria-label="Editar funcionário">
                    <span class="material-symbols-outlined">edit</span>
                </button>

                <button class="tree-icon-btn tree-icon-btn--danger" data-action="delete" aria-label="Excluir funcionário">
                    <span class="material-symbols-outlined">delete</span>
                </button>

            </div>

        `;

        row.querySelector('[data-action="toggle-status"]').addEventListener("click", () => toggleStatus(funcionario.id));
        row.querySelector('[data-action="edit"]').addEventListener("click", () => editFuncionario(funcionario.id));
        row.querySelector('[data-action="delete"]').addEventListener("click", () => deleteFuncionario(funcionario.id));

        list.appendChild(row);

    });

}

/* ==========================================================
   CARREGAR DO BACKEND
========================================================== */

async function loadEquipe() {

    try {

        const [obra, lista] = await Promise.all([
            apiFetch(`/obras/${obraId}`),
            apiFetch(`/obras/${obraId}/funcionarios`)
        ]);

        document.getElementById("obra-name-subtitle").textContent =
            `${obra.name} — funcionários próprios cadastrados nesta obra.`;

        funcionarios = lista;

        renderEquipe();

    } catch (error) {
        showToast(`Erro ao carregar a equipe: ${error.message}`);
    }

}

/* ==========================================================
   CRIAR / EDITAR / EXCLUIR / ALTERNAR STATUS
========================================================== */

async function addFuncionario() {

    const name = prompt("Nome do funcionário:");
    if (!name || !name.trim()) return;

    const funcao = prompt("Função (ex: Pedreiro, Mestre de obra):");
    if (!funcao || !funcao.trim()) return;

    const matricula = prompt("Matrícula ou código interno (opcional):") || "";
    const observacao = prompt("Observação (opcional):") || "";

    try {

        await apiFetch(`/obras/${obraId}/funcionarios`, {
            method: "POST",
            body: JSON.stringify({
                name: name.trim(),
                funcao: funcao.trim(),
                matricula: matricula.trim(),
                observacao: observacao.trim()
            })
        });

        showToast("Funcionário cadastrado.");

        await loadEquipe();

    } catch (error) {
        showToast(error.message);
    }

}

async function editFuncionario(id) {

    const funcionario = funcionarios.find((f) => f.id === id);

    const newName = prompt("Nome:", funcionario.name);
    if (!newName || !newName.trim()) return;

    const newFuncao = prompt("Função:", funcionario.funcao);
    if (!newFuncao || !newFuncao.trim()) return;

    const newMatricula = prompt("Matrícula ou código interno (opcional):", funcionario.matricula || "");
    const newObservacao = prompt("Observação (opcional):", funcionario.observacao || "");

    try {

        await apiFetch(`/funcionarios/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                name: newName.trim(),
                funcao: newFuncao.trim(),
                matricula: (newMatricula || "").trim(),
                observacao: (newObservacao || "").trim()
            })
        });

        showToast("Funcionário atualizado.");

        await loadEquipe();

    } catch (error) {
        showToast(error.message);
    }

}

async function toggleStatus(id) {

    const funcionario = funcionarios.find((f) => f.id === id);

    const novoStatus = funcionario.status === "ativo" ? "inativo" : "ativo";

    try {

        await apiFetch(`/funcionarios/${id}`, {
            method: "PUT",
            body: JSON.stringify({ status: novoStatus })
        });

        showToast(novoStatus === "ativo" ? "Funcionário reativado." : "Funcionário marcado como inativo.");

        await loadEquipe();

    } catch (error) {
        showToast(error.message);
    }

}

async function deleteFuncionario(id) {

    const funcionario = funcionarios.find((f) => f.id === id);

    const confirmed = confirm(`Excluir "${funcionario.name}" da equipe da obra?`);

    if (!confirmed) return;

    try {

        await apiFetch(`/funcionarios/${id}`, { method: "DELETE" });

        showToast("Funcionário excluído.");

        await loadEquipe();

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

    loadEquipe();

    document.getElementById("add-funcionario-btn").addEventListener("click", addFuncionario);

    document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = `obra.html?id=${obraId}`;
    });

});
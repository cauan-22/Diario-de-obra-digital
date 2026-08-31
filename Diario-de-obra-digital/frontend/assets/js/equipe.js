/* ==========================================================
   BUILDTRACK
   Arquivo: equipe.js
   Descrição: Lógica da página Equipe da Obra (funcionários próprios)
========================================================== */

function getObraIdFromURL() {

    const params = new URLSearchParams(window.location.search);

    return Number(params.get("id")) || 1;

}

const obraId = getObraIdFromURL();

let nextFuncionarioId = 4;

/* ==========================================================
   DADOS FICTÍCIOS (futuramente virão do backend)
   Cada obra tem sua própria equipe — nunca compartilhada.
========================================================== */

const equipesPorObra = {

    1: {
        obraName: "Casa Jardim",
        funcionarios: [
            { id: 1, name: "Carlos Mendes", funcao: "Pedreiro", matricula: "0012", status: "ativo", observacao: "" },
            { id: 2, name: "João Silva", funcao: "Mestre de Obra", matricula: "0003", status: "ativo", observacao: "" },
            { id: 3, name: "Pedro Santos", funcao: "Servente", matricula: "", status: "inativo", observacao: "Afastado desde 10/08." }
        ]
    }

};

if (!equipesPorObra[obraId]) {
    equipesPorObra[obraId] = { obraName: "Obra", funcionarios: [] };
}

const equipe = equipesPorObra[obraId];

/* ==========================================================
   RENDERIZAÇÃO
========================================================== */

function renderEquipe() {

    const list = document.getElementById("funcionarios-list");
    const emptyState = document.getElementById("empty-state");

    list.innerHTML = "";

    emptyState.hidden = equipe.funcionarios.length > 0;

    equipe.funcionarios.forEach((funcionario) => {

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
   CRIAR / EDITAR / EXCLUIR / ALTERNAR STATUS
========================================================== */

function addFuncionario() {

    const name = prompt("Nome do funcionário:");
    if (!name || !name.trim()) return;

    const funcao = prompt("Função (ex: Pedreiro, Mestre de obra):");
    if (!funcao || !funcao.trim()) return;

    const matricula = prompt("Matrícula ou código interno (opcional):") || "";
    const observacao = prompt("Observação (opcional):") || "";

    equipe.funcionarios.push({
        id: nextFuncionarioId++,
        name: name.trim(),
        funcao: funcao.trim(),
        matricula: matricula.trim(),
        status: "ativo",
        observacao: observacao.trim()
    });

    renderEquipe();

    showToast("Funcionário cadastrado.");

}

function editFuncionario(id) {

    const funcionario = equipe.funcionarios.find((f) => f.id === id);

    const newName = prompt("Nome:", funcionario.name);
    if (!newName || !newName.trim()) return;

    const newFuncao = prompt("Função:", funcionario.funcao);
    if (!newFuncao || !newFuncao.trim()) return;

    const newMatricula = prompt("Matrícula ou código interno (opcional):", funcionario.matricula);
    const newObservacao = prompt("Observação (opcional):", funcionario.observacao);

    funcionario.name = newName.trim();
    funcionario.funcao = newFuncao.trim();
    funcionario.matricula = (newMatricula || "").trim();
    funcionario.observacao = (newObservacao || "").trim();

    renderEquipe();

    showToast("Funcionário atualizado.");

}

function toggleStatus(id) {

    const funcionario = equipe.funcionarios.find((f) => f.id === id);

    funcionario.status = funcionario.status === "ativo" ? "inativo" : "ativo";

    renderEquipe();

    showToast(funcionario.status === "ativo" ? "Funcionário reativado." : "Funcionário marcado como inativo.");

}

function deleteFuncionario(id) {

    const funcionario = equipe.funcionarios.find((f) => f.id === id);

    const confirmed = confirm(`Excluir "${funcionario.name}" da equipe da obra?`);

    if (!confirmed) return;

    equipe.funcionarios = equipe.funcionarios.filter((f) => f.id !== id);

    renderEquipe();

    showToast("Funcionário excluído.");

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
        `${equipe.obraName} — funcionários próprios cadastrados nesta obra.`;

    renderEquipe();

    document.getElementById("add-funcionario-btn").addEventListener("click", addFuncionario);

    document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = `obra.html?id=${obraId}`;
    });

});
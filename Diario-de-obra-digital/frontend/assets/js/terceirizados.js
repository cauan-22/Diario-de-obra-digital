/* ==========================================================
   BUILDTRACK
   Arquivo: terceirizados.js
   Descrição: Lógica da página Empresas Terceirizadas
========================================================== */

function getObraIdFromURL() {

    const params = new URLSearchParams(window.location.search);

    return Number(params.get("id")) || 1;

}

const obraId = getObraIdFromURL();

let nextEmpresaId = 3;
let nextFuncionarioTercId = 6;

/* ==========================================================
   DADOS FICTÍCIOS (futuramente virão do backend)
   Cada obra tem suas próprias empresas — nunca compartilhadas.
========================================================== */

const terceirizadosPorObra = {

    1: {
        obraName: "Casa Jardim",
        empresas: [
            {
                id: 1,
                name: "Eletrosul",
                especialidade: "Eletricidade",
                funcionarios: [
                    { id: 1, name: "João", funcao: "Eletricista", status: "ativo" },
                    { id: 2, name: "Marcos", funcao: "Eletricista", status: "ativo" },
                    { id: 3, name: "Rafael", funcao: "Ajudante", status: "ativo" }
                ]
            },
            {
                id: 2,
                name: "Pintura ABC",
                especialidade: "Pintura",
                funcionarios: [
                    { id: 4, name: "Carlos", funcao: "Pintor", status: "ativo" },
                    { id: 5, name: "Lucas", funcao: "Pintor", status: "inativo" }
                ]
            }
        ]
    }

};

if (!terceirizadosPorObra[obraId]) {
    terceirizadosPorObra[obraId] = { obraName: "Obra", empresas: [] };
}

const terceirizados = terceirizadosPorObra[obraId];

const expandedEmpresas = new Set();

/* ==========================================================
   RENDERIZAÇÃO
========================================================== */

function renderTerceirizados() {

    const list = document.getElementById("empresas-list");
    const emptyState = document.getElementById("empty-state");

    list.innerHTML = "";

    emptyState.hidden = terceirizados.empresas.length > 0;

    terceirizados.empresas.forEach((empresa) => {
        list.appendChild(renderEmpresaBlock(empresa));
    });

}

function renderEmpresaBlock(empresa) {

    const isExpanded = expandedEmpresas.has(empresa.id);

    const block = document.createElement("div");

    block.className = "empresa-block";

    block.innerHTML = `

        <div class="empresa-header">

            <span class="material-symbols-outlined tree-chevron ${isExpanded ? "expanded" : ""}">
                chevron_right
            </span>

            <div class="empresa-name-block">
                <div class="empresa-name">${empresa.name}</div>
                <div class="empresa-especialidade">${empresa.especialidade}</div>
            </div>

            <div class="tree-row-actions">

                <button class="tree-icon-btn" data-action="edit-empresa" aria-label="Editar empresa">
                    <span class="material-symbols-outlined">edit</span>
                </button>

                <button class="tree-icon-btn tree-icon-btn--danger" data-action="delete-empresa" aria-label="Excluir empresa">
                    <span class="material-symbols-outlined">delete</span>
                </button>

            </div>

        </div>

        <div class="funcionarios-list ${isExpanded ? "expanded" : ""}" id="funcionarios-${empresa.id}"></div>

    `;

    block.querySelector(".empresa-header").addEventListener("click", (event) => {

        if (event.target.closest(".tree-row-actions")) return;

        toggleEmpresa(empresa.id);

    });

    block.querySelector('[data-action="edit-empresa"]').addEventListener("click", () => editEmpresa(empresa.id));
    block.querySelector('[data-action="delete-empresa"]').addEventListener("click", () => deleteEmpresa(empresa.id));

    const funcionariosContainer = block.querySelector(`#funcionarios-${empresa.id}`);

    empresa.funcionarios.forEach((funcionario) => {
        funcionariosContainer.appendChild(renderFuncionarioTercRow(empresa.id, funcionario));
    });

    const addBtn = document.createElement("button");
    addBtn.className = "add-item-btn tree-add-btn";
    addBtn.type = "button";
    addBtn.textContent = "+ Adicionar funcionário";
    addBtn.addEventListener("click", () => addFuncionarioTerc(empresa.id));

    funcionariosContainer.appendChild(addBtn);

    return block;

}

function renderFuncionarioTercRow(empresaId, funcionario) {

    const row = document.createElement("div");

    row.className = "simple-list-row";

    const statusBadge = funcionario.status === "ativo"
        ? ""
        : `<span class="tree-status-badge tree-status-badge--inativo">Inativo</span>`;

    row.innerHTML = `

        <div class="simple-list-row-main">
            <div class="simple-list-row-name">${funcionario.name}</div>
            <div class="simple-list-row-sub">${funcionario.funcao}</div>
            <div class="simple-list-row-badges">${statusBadge}</div>
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

    row.querySelector('[data-action="toggle-status"]').addEventListener("click", () => toggleFuncionarioStatus(empresaId, funcionario.id));
    row.querySelector('[data-action="edit"]').addEventListener("click", () => editFuncionarioTerc(empresaId, funcionario.id));
    row.querySelector('[data-action="delete"]').addEventListener("click", () => deleteFuncionarioTerc(empresaId, funcionario.id));

    return row;

}

/* ==========================================================
   EXPANDIR / RECOLHER
========================================================== */

function toggleEmpresa(empresaId) {

    if (expandedEmpresas.has(empresaId)) {
        expandedEmpresas.delete(empresaId);
    } else {
        expandedEmpresas.add(empresaId);
    }

    renderTerceirizados();

}

/* ==========================================================
   EMPRESAS — CRIAR / EDITAR / EXCLUIR
========================================================== */

function addEmpresa() {

    const name = prompt("Nome da empresa:");
    if (!name || !name.trim()) return;

    const especialidade = prompt("Especialidade (ex: Elétrica, Pintura, Hidráulica):");
    if (!especialidade || !especialidade.trim()) return;

    const newEmpresa = {
        id: nextEmpresaId++,
        name: name.trim(),
        especialidade: especialidade.trim(),
        funcionarios: []
    };

    terceirizados.empresas.push(newEmpresa);

    expandedEmpresas.add(newEmpresa.id);

    renderTerceirizados();

    showToast("Empresa cadastrada.");

}

function editEmpresa(empresaId) {

    const empresa = terceirizados.empresas.find((e) => e.id === empresaId);

    const newName = prompt("Nome da empresa:", empresa.name);
    if (!newName || !newName.trim()) return;

    const newEspecialidade = prompt("Especialidade:", empresa.especialidade);
    if (!newEspecialidade || !newEspecialidade.trim()) return;

    empresa.name = newName.trim();
    empresa.especialidade = newEspecialidade.trim();

    renderTerceirizados();

    showToast("Empresa atualizada.");

}

function deleteEmpresa(empresaId) {

    const empresa = terceirizados.empresas.find((e) => e.id === empresaId);

    const confirmed = confirm(
        `Excluir a empresa "${empresa.name}"? Todos os funcionários vinculados a ela também serão excluídos.`
    );

    if (!confirmed) return;

    terceirizados.empresas = terceirizados.empresas.filter((e) => e.id !== empresaId);

    renderTerceirizados();

    showToast("Empresa excluída.");

}

/* ==========================================================
   FUNCIONÁRIOS TERCEIRIZADOS — CRIAR / EDITAR / EXCLUIR
========================================================== */

function addFuncionarioTerc(empresaId) {

    const name = prompt("Nome do funcionário:");
    if (!name || !name.trim()) return;

    const funcao = prompt("Função (ex: Eletricista, Ajudante):");
    if (!funcao || !funcao.trim()) return;

    const empresa = terceirizados.empresas.find((e) => e.id === empresaId);

    empresa.funcionarios.push({
        id: nextFuncionarioTercId++,
        name: name.trim(),
        funcao: funcao.trim(),
        status: "ativo"
    });

    expandedEmpresas.add(empresaId);

    renderTerceirizados();

    showToast("Funcionário adicionado.");

}

function editFuncionarioTerc(empresaId, funcId) {

    const empresa = terceirizados.empresas.find((e) => e.id === empresaId);
    const funcionario = empresa.funcionarios.find((f) => f.id === funcId);

    const newName = prompt("Nome:", funcionario.name);
    if (!newName || !newName.trim()) return;

    const newFuncao = prompt("Função:", funcionario.funcao);
    if (!newFuncao || !newFuncao.trim()) return;

    funcionario.name = newName.trim();
    funcionario.funcao = newFuncao.trim();

    renderTerceirizados();

    showToast("Funcionário atualizado.");

}

function toggleFuncionarioStatus(empresaId, funcId) {

    const empresa = terceirizados.empresas.find((e) => e.id === empresaId);
    const funcionario = empresa.funcionarios.find((f) => f.id === funcId);

    funcionario.status = funcionario.status === "ativo" ? "inativo" : "ativo";

    renderTerceirizados();

    showToast(funcionario.status === "ativo" ? "Funcionário reativado." : "Funcionário marcado como inativo.");

}

function deleteFuncionarioTerc(empresaId, funcId) {

    const empresa = terceirizados.empresas.find((e) => e.id === empresaId);
    const funcionario = empresa.funcionarios.find((f) => f.id === funcId);

    const confirmed = confirm(`Excluir "${funcionario.name}" da empresa "${empresa.name}"?`);

    if (!confirmed) return;

    empresa.funcionarios = empresa.funcionarios.filter((f) => f.id !== funcId);

    renderTerceirizados();

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
        `${terceirizados.obraName} — empresas e funcionários vinculados a esta obra.`;

    renderTerceirizados();

    document.getElementById("add-empresa-btn").addEventListener("click", addEmpresa);

    document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = `obra.html?id=${obraId}`;
    });

});
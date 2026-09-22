/* ==========================================================
   BUILDTRACK
   Arquivo: terceirizados.js
   Descrição: Lógica da página Empresas Terceirizadas
========================================================== */

function getObraIdFromURL() {

    const params = new URLSearchParams(window.location.search);

    return Number(params.get("id"));

}

const obraId = getObraIdFromURL();

let empresas = [];

const expandedEmpresas = new Set();

/* ==========================================================
   RENDERIZAÇÃO
========================================================== */

function renderTerceirizados() {

    const list = document.getElementById("empresas-list");
    const emptyState = document.getElementById("empty-state");

    list.innerHTML = "";

    emptyState.hidden = empresas.length > 0;

    empresas.forEach((empresa) => {
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
                <div class="empresa-especialidade">${empresa.especialidade || ""}</div>
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

    row.querySelector('[data-action="toggle-status"]').addEventListener("click", () => toggleFuncionarioStatus(funcionario.id));
    row.querySelector('[data-action="edit"]').addEventListener("click", () => editFuncionarioTerc(funcionario.id));
    row.querySelector('[data-action="delete"]').addEventListener("click", () => deleteFuncionarioTerc(empresaId, funcionario.id));

    return row;

}

/* ==========================================================
   CARREGAR DO BACKEND
========================================================== */

async function loadTerceirizados() {

    try {

        const [obra, lista] = await Promise.all([
            apiFetch(`/obras/${obraId}`),
            apiFetch(`/obras/${obraId}/empresas`)
        ]);

        document.getElementById("obra-name-subtitle").textContent =
            `${obra.name} — empresas e funcionários vinculados a esta obra.`;

        empresas = lista;

        renderTerceirizados();

    } catch (error) {
        showToast(`Erro ao carregar empresas: ${error.message}`);
    }

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

async function addEmpresa() {

    const name = prompt("Nome da empresa:");
    if (!name || !name.trim()) return;

    const especialidade = prompt("Especialidade (ex: Elétrica, Pintura, Hidráulica):");
    if (!especialidade || !especialidade.trim()) return;

    try {

        const nova = await apiFetch(`/obras/${obraId}/empresas`, {
            method: "POST",
            body: JSON.stringify({ name: name.trim(), especialidade: especialidade.trim() })
        });

        expandedEmpresas.add(nova.id);

        showToast("Empresa cadastrada.");

        await loadTerceirizados();

    } catch (error) {
        showToast(error.message);
    }

}

async function editEmpresa(empresaId) {

    const empresa = empresas.find((e) => e.id === empresaId);

    const newName = prompt("Nome da empresa:", empresa.name);
    if (!newName || !newName.trim()) return;

    const newEspecialidade = prompt("Especialidade:", empresa.especialidade || "");
    if (!newEspecialidade || !newEspecialidade.trim()) return;

    try {

        await apiFetch(`/empresas/${empresaId}`, {
            method: "PUT",
            body: JSON.stringify({ name: newName.trim(), especialidade: newEspecialidade.trim() })
        });

        showToast("Empresa atualizada.");

        await loadTerceirizados();

    } catch (error) {
        showToast(error.message);
    }

}

async function deleteEmpresa(empresaId) {

    const empresa = empresas.find((e) => e.id === empresaId);

    const confirmed = confirm(
        `Excluir a empresa "${empresa.name}"? Todos os funcionários vinculados a ela também serão excluídos.`
    );

    if (!confirmed) return;

    try {

        await apiFetch(`/empresas/${empresaId}`, { method: "DELETE" });

        showToast("Empresa excluída.");

        await loadTerceirizados();

    } catch (error) {
        showToast(error.message);
    }

}

/* ==========================================================
   FUNCIONÁRIOS TERCEIRIZADOS — CRIAR / EDITAR / EXCLUIR
========================================================== */

async function addFuncionarioTerc(empresaId) {

    const name = prompt("Nome do funcionário:");
    if (!name || !name.trim()) return;

    const funcao = prompt("Função (ex: Eletricista, Ajudante):");
    if (!funcao || !funcao.trim()) return;

    try {

        await apiFetch(`/empresas/${empresaId}/funcionarios`, {
            method: "POST",
            body: JSON.stringify({ name: name.trim(), funcao: funcao.trim() })
        });

        expandedEmpresas.add(empresaId);

        showToast("Funcionário adicionado.");

        await loadTerceirizados();

    } catch (error) {
        showToast(error.message);
    }

}

function findFuncionarioTerc(funcId) {

    for (const empresa of empresas) {

        const funcionario = empresa.funcionarios.find((f) => f.id === funcId);

        if (funcionario) return funcionario;

    }

    return null;

}

async function editFuncionarioTerc(funcId) {

    const funcionario = findFuncionarioTerc(funcId);

    const newName = prompt("Nome:", funcionario.name);
    if (!newName || !newName.trim()) return;

    const newFuncao = prompt("Função:", funcionario.funcao);
    if (!newFuncao || !newFuncao.trim()) return;

    try {

        await apiFetch(`/funcionarios-terceirizados/${funcId}`, {
            method: "PUT",
            body: JSON.stringify({ name: newName.trim(), funcao: newFuncao.trim() })
        });

        showToast("Funcionário atualizado.");

        await loadTerceirizados();

    } catch (error) {
        showToast(error.message);
    }

}

async function toggleFuncionarioStatus(funcId) {

    const funcionario = findFuncionarioTerc(funcId);

    const novoStatus = funcionario.status === "ativo" ? "inativo" : "ativo";

    try {

        await apiFetch(`/funcionarios-terceirizados/${funcId}`, {
            method: "PUT",
            body: JSON.stringify({ status: novoStatus })
        });

        showToast(novoStatus === "ativo" ? "Funcionário reativado." : "Funcionário marcado como inativo.");

        await loadTerceirizados();

    } catch (error) {
        showToast(error.message);
    }

}

async function deleteFuncionarioTerc(empresaId, funcId) {

    const funcionario = findFuncionarioTerc(funcId);

    const confirmed = confirm(`Excluir "${funcionario.name}"?`);

    if (!confirmed) return;

    try {

        await apiFetch(`/funcionarios-terceirizados/${funcId}`, { method: "DELETE" });

        showToast("Funcionário excluído.");

        await loadTerceirizados();

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

    loadTerceirizados();

    document.getElementById("add-empresa-btn").addEventListener("click", addEmpresa);

    document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = `obra.html?id=${obraId}`;
    });

});
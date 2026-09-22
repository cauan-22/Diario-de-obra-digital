/* ==========================================================
   BUILDTRACK
   Arquivo: equipamentos.js
   Descrição: Lógica da página Equipamentos da Obra
========================================================== */

function getObraIdFromURL() {

    const params = new URLSearchParams(window.location.search);

    return Number(params.get("id"));

}

const obraId = getObraIdFromURL();

let equipamentos = [];

/* ==========================================================
   RENDERIZAÇÃO
========================================================== */

function renderEquipamentos() {

    const list = document.getElementById("equipamentos-list");
    const emptyState = document.getElementById("empty-state");

    list.innerHTML = "";

    emptyState.hidden = equipamentos.length > 0;

    equipamentos.forEach((equipamento) => {

        const row = document.createElement("div");

        row.className = "simple-list-row";

        const statusBadge = equipamento.status === "ativo"
            ? ""
            : `<span class="tree-status-badge tree-status-badge--inativo">Inativo</span>`;

        const idBadge = equipamento.identificacao
            ? `<span class="tree-prazo-badge">${equipamento.identificacao}</span>`
            : "";

        row.innerHTML = `

            <div class="simple-list-row-main">

                <div class="simple-list-row-name">${equipamento.name}</div>
                <div class="simple-list-row-sub">${equipamento.tipo || ""}</div>

                ${equipamento.observacao ? `<div class="simple-list-row-sub">${equipamento.observacao}</div>` : ""}

                <div class="simple-list-row-badges">
                    ${statusBadge}
                    ${idBadge}
                </div>

            </div>

            <div class="tree-row-actions">

                <button
                    class="tree-icon-btn ${equipamento.status === "ativo" ? "tree-icon-btn--active" : ""}"
                    data-action="toggle-status"
                    title="${equipamento.status === "ativo" ? "Marcar como inativo" : "Marcar como ativo"}"
                >
                    <span class="material-symbols-outlined">
                        ${equipamento.status === "ativo" ? "check_circle" : "radio_button_unchecked"}
                    </span>
                </button>

                <button class="tree-icon-btn" data-action="edit" aria-label="Editar equipamento">
                    <span class="material-symbols-outlined">edit</span>
                </button>

                <button class="tree-icon-btn tree-icon-btn--danger" data-action="delete" aria-label="Excluir equipamento">
                    <span class="material-symbols-outlined">delete</span>
                </button>

            </div>

        `;

        row.querySelector('[data-action="toggle-status"]').addEventListener("click", () => toggleStatus(equipamento.id));
        row.querySelector('[data-action="edit"]').addEventListener("click", () => editEquipamento(equipamento.id));
        row.querySelector('[data-action="delete"]').addEventListener("click", () => deleteEquipamento(equipamento.id));

        list.appendChild(row);

    });

}

/* ==========================================================
   CARREGAR DO BACKEND
========================================================== */

async function loadEquipamentos() {

    try {

        const [obra, lista] = await Promise.all([
            apiFetch(`/obras/${obraId}`),
            apiFetch(`/obras/${obraId}/equipamentos`)
        ]);

        document.getElementById("obra-name-subtitle").textContent =
            `${obra.name} — equipamentos cadastrados nesta obra.`;

        equipamentos = lista;

        renderEquipamentos();

    } catch (error) {
        showToast(`Erro ao carregar equipamentos: ${error.message}`);
    }

}

/* ==========================================================
   CRIAR / EDITAR / EXCLUIR / ALTERNAR STATUS
========================================================== */

async function addEquipamento() {

    const name = prompt("Nome do equipamento (ex: Betoneira 01):");
    if (!name || !name.trim()) return;

    const tipo = prompt("Tipo (ex: Betoneira, Escavadeira, Andaime):");
    if (!tipo || !tipo.trim()) return;

    const identificacao = prompt("Identificação ou código interno (opcional):") || "";
    const observacao = prompt("Observação (opcional):") || "";

    try {

        await apiFetch(`/obras/${obraId}/equipamentos`, {
            method: "POST",
            body: JSON.stringify({
                name: name.trim(),
                tipo: tipo.trim(),
                identificacao: identificacao.trim(),
                observacao: observacao.trim()
            })
        });

        showToast("Equipamento cadastrado.");

        await loadEquipamentos();

    } catch (error) {
        showToast(error.message);
    }

}

async function editEquipamento(id) {

    const equipamento = equipamentos.find((e) => e.id === id);

    const newName = prompt("Nome:", equipamento.name);
    if (!newName || !newName.trim()) return;

    const newTipo = prompt("Tipo:", equipamento.tipo || "");
    if (!newTipo || !newTipo.trim()) return;

    const newIdentificacao = prompt("Identificação ou código interno (opcional):", equipamento.identificacao || "");
    const newObservacao = prompt("Observação (opcional):", equipamento.observacao || "");

    try {

        await apiFetch(`/equipamentos/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                name: newName.trim(),
                tipo: newTipo.trim(),
                identificacao: (newIdentificacao || "").trim(),
                observacao: (newObservacao || "").trim()
            })
        });

        showToast("Equipamento atualizado.");

        await loadEquipamentos();

    } catch (error) {
        showToast(error.message);
    }

}

async function toggleStatus(id) {

    const equipamento = equipamentos.find((e) => e.id === id);

    const novoStatus = equipamento.status === "ativo" ? "inativo" : "ativo";

    try {

        await apiFetch(`/equipamentos/${id}`, {
            method: "PUT",
            body: JSON.stringify({ status: novoStatus })
        });

        showToast(novoStatus === "ativo" ? "Equipamento reativado." : "Equipamento marcado como inativo.");

        await loadEquipamentos();

    } catch (error) {
        showToast(error.message);
    }

}

async function deleteEquipamento(id) {

    const equipamento = equipamentos.find((e) => e.id === id);

    const confirmed = confirm(`Excluir "${equipamento.name}" desta obra?`);

    if (!confirmed) return;

    try {

        await apiFetch(`/equipamentos/${id}`, { method: "DELETE" });

        showToast("Equipamento excluído.");

        await loadEquipamentos();

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

    loadEquipamentos();

    document.getElementById("add-equipamento-btn").addEventListener("click", addEquipamento);

    document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = `obra.html?id=${obraId}`;
    });

});
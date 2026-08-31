/* ==========================================================
   BUILDTRACK
   Arquivo: equipamentos.js
   Descrição: Lógica da página Equipamentos da Obra
========================================================== */

function getObraIdFromURL() {

    const params = new URLSearchParams(window.location.search);

    return Number(params.get("id")) || 1;

}

const obraId = getObraIdFromURL();

let nextEquipamentoId = 4;

/* ==========================================================
   DADOS FICTÍCIOS (futuramente virão do backend)
   Cada obra tem seus próprios equipamentos — nunca compartilhados.

   O "status" aqui é se o equipamento está ativo no cadastro da
   obra (ativo/inativo) — diferente do status "operando/parado"
   que é preenchido dia a dia dentro do RDO.
========================================================== */

const equipamentosPorObra = {

    1: {
        obraName: "Casa Jardim",
        equipamentos: [
            { id: 1, name: "Betoneira 01", tipo: "Betoneira", identificacao: "EQ-001", status: "ativo", observacao: "" },
            { id: 2, name: "Mini Escavadeira", tipo: "Escavadeira", identificacao: "EQ-002", status: "ativo", observacao: "" },
            { id: 3, name: "Andaime 03", tipo: "Andaime", identificacao: "EQ-003", status: "inativo", observacao: "Aguardando montagem." }
        ]
    }

};

if (!equipamentosPorObra[obraId]) {
    equipamentosPorObra[obraId] = { obraName: "Obra", equipamentos: [] };
}

const equipamentos = equipamentosPorObra[obraId];

/* ==========================================================
   RENDERIZAÇÃO
========================================================== */

function renderEquipamentos() {

    const list = document.getElementById("equipamentos-list");
    const emptyState = document.getElementById("empty-state");

    list.innerHTML = "";

    emptyState.hidden = equipamentos.equipamentos.length > 0;

    equipamentos.equipamentos.forEach((equipamento) => {

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
                <div class="simple-list-row-sub">${equipamento.tipo}</div>

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
   CRIAR / EDITAR / EXCLUIR / ALTERNAR STATUS
========================================================== */

function addEquipamento() {

    const name = prompt("Nome do equipamento (ex: Betoneira 01):");
    if (!name || !name.trim()) return;

    const tipo = prompt("Tipo (ex: Betoneira, Escavadeira, Andaime):");
    if (!tipo || !tipo.trim()) return;

    const identificacao = prompt("Identificação ou código interno (opcional):") || "";
    const observacao = prompt("Observação (opcional):") || "";

    equipamentos.equipamentos.push({
        id: nextEquipamentoId++,
        name: name.trim(),
        tipo: tipo.trim(),
        identificacao: identificacao.trim(),
        status: "ativo",
        observacao: observacao.trim()
    });

    renderEquipamentos();

    showToast("Equipamento cadastrado.");

}

function editEquipamento(id) {

    const equipamento = equipamentos.equipamentos.find((e) => e.id === id);

    const newName = prompt("Nome:", equipamento.name);
    if (!newName || !newName.trim()) return;

    const newTipo = prompt("Tipo:", equipamento.tipo);
    if (!newTipo || !newTipo.trim()) return;

    const newIdentificacao = prompt("Identificação ou código interno (opcional):", equipamento.identificacao);
    const newObservacao = prompt("Observação (opcional):", equipamento.observacao);

    equipamento.name = newName.trim();
    equipamento.tipo = newTipo.trim();
    equipamento.identificacao = (newIdentificacao || "").trim();
    equipamento.observacao = (newObservacao || "").trim();

    renderEquipamentos();

    showToast("Equipamento atualizado.");

}

function toggleStatus(id) {

    const equipamento = equipamentos.equipamentos.find((e) => e.id === id);

    equipamento.status = equipamento.status === "ativo" ? "inativo" : "ativo";

    renderEquipamentos();

    showToast(equipamento.status === "ativo" ? "Equipamento reativado." : "Equipamento marcado como inativo.");

}

function deleteEquipamento(id) {

    const equipamento = equipamentos.equipamentos.find((e) => e.id === id);

    const confirmed = confirm(`Excluir "${equipamento.name}" desta obra?`);

    if (!confirmed) return;

    equipamentos.equipamentos = equipamentos.equipamentos.filter((e) => e.id !== id);

    renderEquipamentos();

    showToast("Equipamento excluído.");

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
        `${equipamentos.obraName} — equipamentos cadastrados nesta obra.`;

    renderEquipamentos();

    document.getElementById("add-equipamento-btn").addEventListener("click", addEquipamento);

    document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = `obra.html?id=${obraId}`;
    });

});
/* ==========================================================
   BUILDTRACK
   Arquivo: rdo.js
   Descrição: Lógica da página Novo RDO
========================================================== */

/* ==========================================================
   CONTEXTO DA OBRA (dados fictícios, futuramente virá do backend)
   O ID vem da URL (ex: rdo.html?obraId=1), assim o "Voltar"
   sabe para qual obra deve retornar.
========================================================== */

function getObraIdFromURL() {

    const params = new URLSearchParams(window.location.search);

    return Number(params.get("obraId")) || 1;

}

/* Se a URL tiver "rdoId", estamos EDITANDO um RDO existente.
   Ex: rdo.html?obraId=1&rdoId=12 */

function getRdoIdFromURL() {

    const params = new URLSearchParams(window.location.search);

    const value = params.get("rdoId");

    return value ? Number(value) : null;

}

const obraContext = {
    id: getObraIdFromURL(),
    name: "Casa Jardim",
    contract: "CT-2026-014",
    responsible: "Eng. Carlos Mendes",
    crea: "CREA/SC 123456",
    nextRDONumber: 13
};

const editingRdoId = getRdoIdFromURL();
const isEditMode = editingRdoId !== null;

/* Dados fictícios de RDOs já existentes, usados só quando a
   tela abre em modo edição. Chave: "obraId-rdoId". Futuramente
   isso vem do backend, buscado pelo ID. */

const existingRDOs = {

    "1-12": {
        weather: { manha: "bom", tarde: "chuvoso" },
        weatherImpact: "Perda de aproximadamente 2 horas de trabalho devido à chuva.",
        workersOwn: ["01 Engenheiro", "01 Mestre de Obra", "02 Pedreiros"],
        workersOut: ["03 Eletricistas — Empresa X", "02 Pintores — Empresa Y"],
        equipmentOperating: ["01 Betoneira", "01 Mini Escavadeira"],
        equipmentStopped: ["01 Andaime — aguardando montagem"],
        activities: [
            { type: "manual", description: "Execução de alvenaria estrutural no 2º pavimento — Bloco A", observation: "" },
            { type: "manual", description: "Passagem de eletrodutos na laje de cobertura", observation: "" },
            { type: "manual", description: "Limpeza e organização do canteiro", observation: "" }
        ],
        materials: [
            { name: "50 sacos de cimento", fornecedor: "Empresa X", nf: "12345", qtd: "50 sacos" },
            { name: "06 m³ de areia média", fornecedor: "Empresa Y", nf: "12346", qtd: "6 m³" }
        ],
        materialTests: "Coleta de corpo de prova para teste do concreto.",
        occurrenceText: "Atraso na entrega do aço por parte do fornecedor. A atividade de armação foi reprogramada para amanhã.",
        observations: "Serviços executados conforme planejamento. Equipe manteve o ritmo previsto durante o período da manhã."
    }

};

const weekDays = [
    "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
    "Quinta-feira", "Sexta-feira", "Sábado"
];

/* ==========================================================
   CADASTROS DA OBRA (futuramente virão do backend)
   Espelham os mesmos dados usados em estrutura.js, equipe.js,
   terceirizados.js e equipamentos.js — quando o backend existir,
   isso vira uma única chamada por obra, em vez de 4 mocks.
========================================================== */

const estruturaContext = {

    1: {
        etapas: [
            {
                id: 1,
                name: "Estruturas",
                subetapas: [
                    {
                        id: 1,
                        name: "Vigas e Lajes",
                        atividades: [
                            { id: 1, name: "Execução de formas", quantidadeTotal: 120, unidade: "m²" },
                            { id: 2, name: "Montagem de armaduras", quantidadeTotal: null, unidade: null },
                            { id: 3, name: "Concretagem", quantidadeTotal: null, unidade: null }
                        ]
                    },
                    {
                        id: 2,
                        name: "Fundações",
                        atividades: [
                            { id: 4, name: "Escavação", quantidadeTotal: null, unidade: null },
                            { id: 5, name: "Montagem de armaduras", quantidadeTotal: null, unidade: null },
                            { id: 6, name: "Concretagem", quantidadeTotal: null, unidade: null }
                        ]
                    }
                ]
            },
            {
                id: 2,
                name: "Alvenaria",
                subetapas: []
            }
        ]
    }

};

const equipeContext = {

    1: [
        { id: 1, name: "Carlos Mendes", funcao: "Pedreiro", status: "ativo" },
        { id: 2, name: "João Silva", funcao: "Mestre de Obra", status: "ativo" },
        { id: 3, name: "Pedro Santos", funcao: "Servente", status: "inativo" }
    ]

};

const terceirizadosContext = {

    1: [
        {
            id: 1,
            name: "Eletrosul",
            funcionarios: [
                { id: 1, name: "João", funcao: "Eletricista", status: "ativo" },
                { id: 2, name: "Marcos", funcao: "Eletricista", status: "ativo" },
                { id: 3, name: "Rafael", funcao: "Ajudante", status: "ativo" }
            ]
        },
        {
            id: 2,
            name: "Pintura ABC",
            funcionarios: [
                { id: 4, name: "Carlos", funcao: "Pintor", status: "ativo" },
                { id: 5, name: "Lucas", funcao: "Pintor", status: "inativo" }
            ]
        }
    ]

};

const equipamentosContext = {

    1: [
        { id: 1, name: "Betoneira 01", tipo: "Betoneira", status: "ativo" },
        { id: 2, name: "Mini Escavadeira", tipo: "Escavadeira", status: "ativo" },
        { id: 3, name: "Andaime 03", tipo: "Andaime", status: "inativo" }
    ]

};

/* Funções auxiliares para navegar na estrutura pelos IDs
   selecionados nos <select> da seção de atividades. */

function getEtapas() {
    return (estruturaContext[obraContext.id] || estruturaContext[1]).etapas;
}

function getEtapaById(etapaId) {
    return getEtapas().find((e) => e.id === Number(etapaId));
}

function getSubetapaById(etapaId, subId) {
    return getEtapaById(etapaId).subetapas.find((s) => s.id === Number(subId));
}

function getAtividadeById(etapaId, subId, atvId) {
    return getSubetapaById(etapaId, subId).atividades.find((a) => a.id === Number(atvId));
}

/* ==========================================================
   ESTADO DO FORMULÁRIO
   (tudo o que o usuário vai preenchendo fica guardado aqui)
========================================================== */

const rdoState = {

    currentStep: 1,
    totalFormSteps: 9,
    reviewStep: 10,

    weather: {
        manha: null,
        tarde: null
    },

    // Selecionados a partir da Equipe da obra / Empresas terceirizadas
    workersOwnSelected: [],
    workersOutSelected: [],

    // Adicionados manualmente (funcionário avulso, fora do cadastro)
    workersOwnManual: [],
    workersOutManual: [],

    // Selecionados a partir dos Equipamentos cadastrados
    // Formato: { [equipamentoId]: "operando" | "parado" }
    equipmentSelections: {},

    // Equipamentos avulsos, fora do cadastro
    equipmentOperatingManual: [],
    equipmentStoppedManual: [],

    // Cada item é { type: "cadastrada", ... } ou { type: "manual", ... }
    activities: [],

    materials: [],

    photos: []

};

const stepTitles = [
    "Identificação",
    "Condições climáticas",
    "Mão de obra",
    "Equipamentos",
    "Atividades realizadas",
    "Materiais e suprimentos",
    "Ocorrências",
    "Evidências",
    "Observações",
    "Revisão"
];

/* ==========================================================
   PREENCHIMENTO AUTOMÁTICO (ETAPA 01)
========================================================== */

function fillIdentification() {

    const today = new Date();

    const dateFormatted = today.toLocaleDateString("pt-BR");

    const dayOfWeek = weekDays[today.getDay()];

    document.getElementById("field-obra").textContent = obraContext.name;
    document.getElementById("field-contrato").textContent = obraContext.contract;
    document.getElementById("field-data").textContent = dateFormatted;
    document.getElementById("field-dia-semana").textContent = dayOfWeek;
    document.getElementById("field-responsavel").textContent = obraContext.responsible;
    document.getElementById("field-crea").textContent = obraContext.crea;

    document.getElementById("rdo-obra-name").textContent = obraContext.name;

    const rdoNumber = isEditMode ? editingRdoId : obraContext.nextRDONumber;

    document.getElementById("rdo-number").textContent =
        `RDO Nº ${String(rdoNumber).padStart(3, "0")}`;

    document.getElementById("rdo-page-title").textContent =
        isEditMode ? "Editar RDO" : "Novo RDO";

    document.title = isEditMode ? "Editar RDO | BuildTrack" : "Novo RDO | BuildTrack";

    document.getElementById("review-data").textContent = dateFormatted;

}

/* ==========================================================
   NAVEGAÇÃO ENTRE ETAPAS
========================================================== */

function goToStep(step) {

    rdoState.currentStep = step;

    document.querySelectorAll(".rdo-step").forEach((section) => {
        section.classList.toggle(
            "active",
            Number(section.dataset.step) === step
        );
    });

    updateProgress();
    updateNavButtons();

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (step === rdoState.reviewStep) {
        renderReview();
    }

}

function updateProgress() {

    const step = rdoState.currentStep;

    const label = step <= rdoState.totalFormSteps
        ? `${String(step).padStart(2, "0")} / ${String(rdoState.totalFormSteps).padStart(2, "0")}`
        : "Revisão";

    document.getElementById("progress-step-label").textContent = label;

    document.getElementById("progress-step-title").textContent =
        stepTitles[step - 1];

    const percent = (step / rdoState.reviewStep) * 100;

    document.getElementById("progress-fill").style.width = `${percent}%`;

}

function updateNavButtons() {

    const step = rdoState.currentStep;

    const backBtn = document.getElementById("btn-back");
    const nextBtn = document.getElementById("btn-next");

    // Botão da esquerda: "Voltar" nas etapas do meio,
    // "Salvar rascunho" na revisão, escondido na primeira etapa.

    if (step === 1) {
        backBtn.disabled = true;
        backBtn.textContent = "Voltar";
    } else if (step === rdoState.reviewStep) {
        backBtn.disabled = false;
        backBtn.textContent = "Salvar rascunho";
    } else {
        backBtn.disabled = false;
        backBtn.textContent = "Voltar";
    }

    // Botão da direita: "Próximo", depois "Revisar RDO",
    // e por fim "Salvar RDO" na revisão.

    if (step < rdoState.totalFormSteps) {
        nextBtn.textContent = "Próximo";
    } else if (step === rdoState.totalFormSteps) {
        nextBtn.textContent = "Revisar RDO";
    } else {
        nextBtn.textContent = isEditMode ? "Salvar alterações" : "Salvar RDO";
    }

}

function handleBackClick() {

    const step = rdoState.currentStep;

    if (step === rdoState.reviewStep) {
        saveDraft();
        return;
    }

    if (step > 1) {
        goToStep(step - 1);
    }

}

function handleNextClick() {

    const step = rdoState.currentStep;

    if (step === rdoState.reviewStep) {
        saveRDO();
        return;
    }

    goToStep(step + 1);

}

/* ==========================================================
   CONDIÇÕES CLIMÁTICAS
========================================================== */

function setupWeatherGroups() {

    document.querySelectorAll(".weather-group").forEach((group) => {

        const period = group.dataset.period;

        group.querySelectorAll(".weather-option").forEach((button) => {

            button.addEventListener("click", () => {

                group.querySelectorAll(".weather-option").forEach((btn) => {
                    btn.classList.remove("active");
                });

                button.classList.add("active");

                rdoState.weather[period] = button.dataset.value;

            });

        });

    });

}

/* ==========================================================
   LISTAS SIMPLES (mão de obra e equipamentos)
   Uma função genérica cuida das 4 listas desse tipo.
========================================================== */

function setupSimpleList({ inputId, addBtnId, listId, array, onChange }) {

    const input = document.getElementById(inputId);
    const addBtn = document.getElementById(addBtnId);
    const list = document.getElementById(listId);

    function render() {

        list.innerHTML = "";

        array.forEach((text, index) => {

            const li = document.createElement("li");

            li.innerHTML = `
                <span>${text}</span>
                <button class="remove-item-btn" type="button" aria-label="Remover">×</button>
            `;

            li.querySelector(".remove-item-btn").addEventListener("click", () => {
                array.splice(index, 1);
                render();
                if (onChange) onChange();
            });

            list.appendChild(li);

        });

    }

    function addItem() {

        const value = input.value.trim();

        if (!value) return;

        array.push(value);

        input.value = "";

        render();

        if (onChange) onChange();

    }

    addBtn.addEventListener("click", addItem);

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addItem();
        }
    });

    // Desenha o estado inicial (importante para o modo edição,
    // que já chega com itens preenchidos no array).
    render();

    return render;

}

/* Soma o número no início de cada item manual (ex: "02 Pedreiros" -> 2).
   Se não houver número, conta como 1 trabalhador. */

function countWorkers(list) {

    return list.reduce((total, text) => {
        const match = text.match(/^(\d+)/);
        return total + (match ? Number(match[1]) : 1);
    }, 0);

}

function updateWorkerTotal() {

    const manualTotal = countWorkers(rdoState.workersOwnManual) + countWorkers(rdoState.workersOutManual);

    const selectedTotal = rdoState.workersOwnSelected.length + rdoState.workersOutSelected.length;

    const total = manualTotal + selectedTotal;

    document.getElementById("worker-total").textContent =
        String(total).padStart(2, "0");

}

/* Revela o formulário de adição manual (e some com o botão que
   o revelou), reaproveitado nas 3 seções que têm essa opção. */

function setupManualToggle(toggleBtnId, containerId) {

    const toggleBtn = document.getElementById(toggleBtnId);
    const container = document.getElementById(containerId);

    toggleBtn.addEventListener("click", () => {
        container.hidden = false;
        toggleBtn.hidden = true;
    });

}

/* ==========================================================
   CHECKLIST — EQUIPE PRÓPRIA (cadastrada em "Equipe da obra")
========================================================== */

function setupWorkerOwnChecklist() {

    const container = document.getElementById("worker-own-checklist");
    const emptyState = document.getElementById("worker-own-empty");

    const funcionarios = (equipeContext[obraContext.id] || []).filter((f) => f.status === "ativo");

    emptyState.hidden = funcionarios.length > 0;

    funcionarios.forEach((funcionario) => {

        const row = document.createElement("label");

        row.className = "checklist-row";

        row.innerHTML = `
            <input type="checkbox" value="${funcionario.id}">
            <span class="checklist-row-name">
                ${funcionario.name}
                <small>${funcionario.funcao}</small>
            </span>
        `;

        row.querySelector("input").addEventListener("change", (event) => {

            if (event.target.checked) {
                rdoState.workersOwnSelected.push(funcionario.id);
            } else {
                rdoState.workersOwnSelected = rdoState.workersOwnSelected.filter((id) => id !== funcionario.id);
            }

            updateWorkerTotal();

        });

        container.appendChild(row);

    });

}

/* ==========================================================
   CHECKLIST — EQUIPE TERCEIRIZADA (agrupada por empresa)
========================================================== */

function setupWorkerOutChecklist() {

    const container = document.getElementById("worker-out-checklist");
    const emptyState = document.getElementById("worker-out-empty");

    const empresas = terceirizadosContext[obraContext.id] || [];

    emptyState.hidden = empresas.length > 0;

    empresas.forEach((empresa) => {

        const ativos = empresa.funcionarios.filter((f) => f.status === "ativo");

        if (ativos.length === 0) return;

        const label = document.createElement("div");
        label.className = "checklist-empresa-label";
        label.textContent = empresa.name;
        container.appendChild(label);

        ativos.forEach((funcionario) => {

            const key = `${empresa.id}:${funcionario.id}`;

            const row = document.createElement("label");

            row.className = "checklist-row";

            row.innerHTML = `
                <input type="checkbox" value="${key}">
                <span class="checklist-row-name">
                    ${funcionario.name}
                    <small>${funcionario.funcao} — ${empresa.name}</small>
                </span>
            `;

            row.querySelector("input").addEventListener("change", (event) => {

                if (event.target.checked) {
                    rdoState.workersOutSelected.push(key);
                } else {
                    rdoState.workersOutSelected = rdoState.workersOutSelected.filter((k) => k !== key);
                }

                updateWorkerTotal();

            });

            container.appendChild(row);

        });

    });

}

/* ==========================================================
   CHECKLIST — EQUIPAMENTOS CADASTRADOS
========================================================== */

function setupEquipmentChecklist() {

    const container = document.getElementById("equipment-checklist");
    const emptyState = document.getElementById("equipment-empty");

    const equipamentosAtivos = (equipamentosContext[obraContext.id] || []).filter((e) => e.status === "ativo");

    emptyState.hidden = equipamentosAtivos.length > 0;

    equipamentosAtivos.forEach((equipamento) => {

        const row = document.createElement("div");

        row.className = "checklist-row";

        row.innerHTML = `
            <span class="checklist-row-name">
                ${equipamento.name}
                <small>${equipamento.tipo}</small>
            </span>
            <div class="mini-toggle-group">
                <button type="button" class="mini-toggle-btn" data-value="operando">Operando</button>
                <button type="button" class="mini-toggle-btn" data-value="parado">Parado</button>
            </div>
        `;

        const buttons = row.querySelectorAll(".mini-toggle-btn");

        buttons.forEach((button) => {

            button.addEventListener("click", () => {

                const wasActive = button.classList.contains("active");

                buttons.forEach((b) => b.classList.remove("active"));

                if (wasActive) {
                    delete rdoState.equipmentSelections[equipamento.id];
                } else {
                    button.classList.add("active");
                    rdoState.equipmentSelections[equipamento.id] = button.dataset.value;
                }

            });

        });

        container.appendChild(row);

    });

}

/* ==========================================================
   ATIVIDADES REALIZADAS
   Cada atividade vem da estrutura cadastrada (etapa > subetapa
   > atividade) ou é adicionada manualmente, quando a obra ainda
   não tem essa atividade no cadastro.
========================================================== */

function renderActivities() {

    const list = document.getElementById("activity-list");

    list.innerHTML = "";

    rdoState.activities.forEach((activity, index) => {

        const li = document.createElement("li");

        const number = String(index + 1).padStart(2, "0");

        const content = activity.type === "cadastrada"
            ? `
                <strong>${activity.etapaName}</strong>
                <span class="activity-breadcrumb"> › ${activity.subetapaName} › ${activity.atividadeName}</span>
                ${activity.quantidade ? `<div class="activity-quantity">${activity.quantidade} ${activity.unidade} realizados hoje</div>` : ""}
                ${activity.observation ? `<div class="activity-observation">${activity.observation}</div>` : ""}
            `
            : `
                <strong>${activity.description}</strong>
                <span class="activity-manual-tag">Manual</span>
                ${activity.observation ? `<div class="activity-observation">${activity.observation}</div>` : ""}
            `;

        li.innerHTML = `
            <span class="activity-number">${number}</span>
            <span class="activity-text">${content}</span>
            <button class="remove-item-btn" type="button" aria-label="Remover">×</button>
        `;

        li.querySelector(".remove-item-btn").addEventListener("click", () => {
            rdoState.activities.splice(index, 1);
            renderActivities();
        });

        list.appendChild(li);

    });

}

/* Mostra/esconde o campo de quantidade dependendo da atividade
   selecionada ter (ou não) uma meta de quantidade cadastrada. */

function updateActivityQuantityField(atividade) {

    const group = document.getElementById("activity-quantity-group");
    const label = document.getElementById("activity-quantity-label");
    const input = document.getElementById("activity-quantity-input");

    if (atividade && atividade.quantidadeTotal) {
        group.hidden = false;
        label.textContent = `Quantidade realizada hoje (${atividade.unidade})`;
    } else {
        group.hidden = true;
    }

    input.value = "";

}

function populateEtapaSelect() {

    const select = document.getElementById("activity-etapa-select");

    getEtapas().forEach((etapa) => {

        const option = document.createElement("option");
        option.value = etapa.id;
        option.textContent = etapa.name;

        select.appendChild(option);

    });

}

function populateSubetapaSelect(etapaId) {

    const select = document.getElementById("activity-subetapa-select");

    if (!etapaId) {
        select.innerHTML = '<option value="">Selecione a etapa primeiro</option>';
        select.disabled = true;
        return;
    }

    const etapa = getEtapaById(etapaId);

    select.innerHTML = '<option value="">Selecione a subetapa...</option>';

    etapa.subetapas.forEach((sub) => {

        const option = document.createElement("option");
        option.value = sub.id;
        option.textContent = sub.name;

        select.appendChild(option);

    });

    select.disabled = etapa.subetapas.length === 0;

}

function populateAtividadeSelect(etapaId, subId) {

    const select = document.getElementById("activity-select");

    if (!subId) {
        select.innerHTML = '<option value="">Selecione a subetapa primeiro</option>';
        select.disabled = true;
        updateActivityQuantityField(null);
        return;
    }

    const sub = getSubetapaById(etapaId, subId);

    select.innerHTML = '<option value="">Selecione a atividade...</option>';

    sub.atividades.forEach((atividade) => {

        const option = document.createElement("option");
        option.value = atividade.id;
        option.textContent = atividade.name;

        select.appendChild(option);

    });

    select.disabled = sub.atividades.length === 0;

    updateActivityQuantityField(null);

}

function setupActivitySelects() {

    populateEtapaSelect();

    const etapaSelect = document.getElementById("activity-etapa-select");
    const subetapaSelect = document.getElementById("activity-subetapa-select");
    const atividadeSelect = document.getElementById("activity-select");

    etapaSelect.addEventListener("change", () => {

        populateSubetapaSelect(etapaSelect.value);

        atividadeSelect.innerHTML = '<option value="">Selecione a subetapa primeiro</option>';
        atividadeSelect.disabled = true;

        updateActivityQuantityField(null);

    });

    subetapaSelect.addEventListener("change", () => {
        populateAtividadeSelect(etapaSelect.value, subetapaSelect.value);
    });

    atividadeSelect.addEventListener("change", () => {

        if (!atividadeSelect.value) {
            updateActivityQuantityField(null);
            return;
        }

        const atividade = getAtividadeById(etapaSelect.value, subetapaSelect.value, atividadeSelect.value);

        updateActivityQuantityField(atividade);

    });

    document.getElementById("activity-add-cadastrada").addEventListener("click", addAtividadeCadastrada);

}

function addAtividadeCadastrada() {

    const etapaSelect = document.getElementById("activity-etapa-select");
    const subetapaSelect = document.getElementById("activity-subetapa-select");
    const atividadeSelect = document.getElementById("activity-select");

    if (!etapaSelect.value || !subetapaSelect.value || !atividadeSelect.value) {
        showToast("Selecione a etapa, a subetapa e a atividade.");
        return;
    }

    const etapa = getEtapaById(etapaSelect.value);
    const sub = getSubetapaById(etapaSelect.value, subetapaSelect.value);
    const atividade = getAtividadeById(etapaSelect.value, subetapaSelect.value, atividadeSelect.value);

    const quantidadeInput = document.getElementById("activity-quantity-input");
    const observationInput = document.getElementById("activity-observation-input");

    rdoState.activities.push({
        type: "cadastrada",
        etapaId: etapa.id,
        subetapaId: sub.id,
        atividadeId: atividade.id,
        etapaName: etapa.name,
        subetapaName: sub.name,
        atividadeName: atividade.name,
        quantidade: atividade.quantidadeTotal ? (Number(quantidadeInput.value) || 0) : null,
        unidade: atividade.unidade || null,
        observation: observationInput.value.trim()
    });

    observationInput.value = "";
    updateActivityQuantityField(null);

    renderActivities();

    showToast("Atividade adicionada.");

}

/* Atividade manual — para quando a obra ainda não tem essa
   atividade cadastrada na estrutura. Não altera o cadastro. */

function setupActivityManual() {

    const toggleBtn = document.getElementById("activity-manual-toggle");
    const form = document.getElementById("activity-manual-form");
    const cancelBtn = document.getElementById("activity-manual-cancel");
    const confirmBtn = document.getElementById("activity-manual-confirm");
    const nameInput = document.getElementById("activity-manual-input");
    const observationInput = document.getElementById("activity-manual-observation");

    toggleBtn.addEventListener("click", () => {
        form.hidden = false;
    });

    cancelBtn.addEventListener("click", () => {
        nameInput.value = "";
        observationInput.value = "";
        form.hidden = true;
    });

    confirmBtn.addEventListener("click", () => {

        const name = nameInput.value.trim();

        if (!name) return;

        rdoState.activities.push({
            type: "manual",
            description: name,
            observation: observationInput.value.trim()
        });

        nameInput.value = "";
        observationInput.value = "";
        form.hidden = true;

        renderActivities();

        showToast("Atividade manual adicionada.");

    });

}

/* ==========================================================
   MATERIAIS E SUPRIMENTOS
========================================================== */

function renderMaterials() {

    const list = document.getElementById("material-list");

    list.innerHTML = "";

    rdoState.materials.forEach((material, index) => {

        const li = document.createElement("li");

        li.innerHTML = `
            <div class="material-item-top">
                <strong>${material.name}</strong>
                <button class="remove-item-btn" type="button" aria-label="Remover">×</button>
            </div>
            <div class="material-item-details">
                ${material.fornecedor} · NF ${material.nf} · ${material.qtd}
            </div>
        `;

        li.querySelector(".remove-item-btn").addEventListener("click", () => {
            rdoState.materials.splice(index, 1);
            renderMaterials();
        });

        list.appendChild(li);

    });

}

function setupMaterials() {

    const toggleBtn = document.getElementById("material-add-toggle");
    const form = document.getElementById("material-form");
    const cancelBtn = document.getElementById("material-cancel");
    const confirmBtn = document.getElementById("material-confirm");

    const nameInput = document.getElementById("material-name");
    const fornecedorInput = document.getElementById("material-fornecedor");
    const nfInput = document.getElementById("material-nf");
    const qtdInput = document.getElementById("material-qtd");

    function clearForm() {
        nameInput.value = "";
        fornecedorInput.value = "";
        nfInput.value = "";
        qtdInput.value = "";
    }

    toggleBtn.addEventListener("click", () => {
        form.hidden = false;
        toggleBtn.hidden = true;
    });

    cancelBtn.addEventListener("click", () => {
        clearForm();
        form.hidden = true;
        toggleBtn.hidden = false;
    });

    confirmBtn.addEventListener("click", () => {

        const name = nameInput.value.trim();

        if (!name) return;

        rdoState.materials.push({
            name,
            fornecedor: fornecedorInput.value.trim() || "—",
            nf: nfInput.value.trim() || "—",
            qtd: qtdInput.value.trim() || "—"
        });

        clearForm();

        form.hidden = true;
        toggleBtn.hidden = false;

        renderMaterials();

    });

}

/* ==========================================================
   OCORRÊNCIAS
========================================================== */

function setupOccurrences() {

    const checkbox = document.getElementById("no-occurrence");
    const textarea = document.getElementById("occurrence-text");

    checkbox.addEventListener("change", () => {

        if (checkbox.checked) {
            textarea.value = "";
            textarea.disabled = true;
        } else {
            textarea.disabled = false;
        }

    });

}

/* ==========================================================
   EVIDÊNCIAS (FOTOS)
========================================================== */

function renderPhotos() {

    const list = document.getElementById("photo-list");

    list.innerHTML = "";

    rdoState.photos.forEach((photo, index) => {

        const item = document.createElement("div");

        item.className = "photo-item";

        item.innerHTML = `
            <img src="${photo.url}" alt="Foto do dia">
            <div class="photo-item-fields">
                <input
                    type="text"
                    placeholder="Descrição da foto"
                    value="${photo.description}"
                >
                <button class="photo-item-remove" type="button">Remover</button>
            </div>
        `;

        item.querySelector("input").addEventListener("input", (event) => {
            photo.description = event.target.value;
        });

        item.querySelector(".photo-item-remove").addEventListener("click", () => {
            rdoState.photos.splice(index, 1);
            renderPhotos();
        });

        list.appendChild(item);

    });

}

function setupPhotos() {

    const fileInput = document.getElementById("photo-input");
    const addBtn = document.getElementById("photo-add-btn");

    addBtn.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", () => {

        const file = fileInput.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {

            rdoState.photos.push({
                url: reader.result,
                description: ""
            });

            renderPhotos();

        };

        reader.readAsDataURL(file);

        fileInput.value = "";

    });

}

/* ==========================================================
   REVISÃO
========================================================== */

function renderReview() {

    const totalWorkers = countWorkers(rdoState.workersOwnManual) + countWorkers(rdoState.workersOutManual)
        + rdoState.workersOwnSelected.length + rdoState.workersOutSelected.length;

    const hasOccurrence = document.getElementById("occurrence-text").value.trim().length > 0
        && !document.getElementById("no-occurrence").checked;

    document.getElementById("review-activities").textContent =
        String(rdoState.activities.length).padStart(2, "0");

    document.getElementById("review-workers").textContent =
        String(totalWorkers).padStart(2, "0");

    document.getElementById("review-materials").textContent =
        String(rdoState.materials.length).padStart(2, "0");

    document.getElementById("review-occurrences").textContent =
        hasOccurrence ? "01" : "00";

    document.getElementById("review-photos").textContent =
        String(rdoState.photos.length).padStart(2, "0");

}

/* ==========================================================
   VALIDAÇÃO E SALVAMENTO
========================================================== */

function validateRDO() {

    const missing = [];

    if (!rdoState.weather.manha || !rdoState.weather.tarde) {
        missing.push("condições climáticas");
    }

    if (rdoState.activities.length === 0) {
        missing.push("pelo menos uma atividade");
    }

    return missing;

}

function saveRDO() {

    const missing = validateRDO();

    if (missing.length > 0) {
        showToast(`Preencha antes de salvar: ${missing.join(", ")}.`);
        return;
    }

    // Futuramente: enviar rdoState para o backend
    // (POST para criar, PUT para editar).
    console.log(isEditMode ? "Alterações salvas:" : "RDO salvo:", rdoState);

    if (isEditMode) {

        showToast("Alterações salvas com sucesso.");

        setTimeout(() => {
            window.location.href = `rdo-detalhes.html?obra=${obraContext.id}&rdo=${editingRdoId}`;
        }, 900);

    } else {

        showToast("RDO salvo com sucesso.");

    }

}

function saveDraft() {

    // Futuramente: salvar rdoState como rascunho no backend/localStorage.
    console.log("Rascunho salvo:", rdoState);

    showToast("Rascunho salvo. Você pode continuar depois.");

}

/* ==========================================================
   AVISO (TOAST)
========================================================== */

let toastTimeout = null;

function showToast(message) {

    const toast = document.getElementById("rdo-toast");

    toast.textContent = message;

    toast.classList.add("visible");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("visible");
    }, 3000);

}

/* ==========================================================
   VOLTAR PARA A OBRA
========================================================== */

function handleBackToObra() {

    window.location.href = `obra.html?id=${obraContext.id}`;

}

/* ==========================================================
   CARREGAR RDO EXISTENTE (MODO EDIÇÃO)
========================================================== */

function loadExistingRDOIntoState() {

    if (!isEditMode) return;

    const key = `${obraContext.id}-${editingRdoId}`;
    const existing = existingRDOs[key];

    if (!existing) return;

    rdoState.weather.manha = existing.weather.manha;
    rdoState.weather.tarde = existing.weather.tarde;

    rdoState.workersOwnManual = [...existing.workersOwn];
    rdoState.workersOutManual = [...existing.workersOut];

    rdoState.equipmentOperatingManual = [...existing.equipmentOperating];
    rdoState.equipmentStoppedManual = [...existing.equipmentStopped];

    rdoState.activities = [...existing.activities];

    rdoState.materials = [...existing.materials];

    // Campos de texto simples são preenchidos direto no DOM,
    // já que não fazem parte do rdoState hoje.
    document.getElementById("weather-impact").value = existing.weatherImpact || "";
    document.getElementById("material-tests").value = existing.materialTests || "";
    document.getElementById("observations-text").value = existing.observations || "";

    const occurrenceText = document.getElementById("occurrence-text");
    const noOccurrenceCheckbox = document.getElementById("no-occurrence");

    if (existing.occurrenceText) {
        occurrenceText.value = existing.occurrenceText;
    } else {
        noOccurrenceCheckbox.checked = true;
        occurrenceText.disabled = true;
    }

    // Marca visualmente os botões de clima já selecionados
    document.querySelectorAll(".weather-group").forEach((group) => {

        const period = group.dataset.period;
        const value = rdoState.weather[period];

        group.querySelectorAll(".weather-option").forEach((button) => {
            button.classList.toggle("active", button.dataset.value === value);
        });

    });

}

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    fillIdentification();

    setupWeatherGroups();

    loadExistingRDOIntoState();

    // Mão de obra: cadastro (checklist) + manual (fallback)
    setupWorkerOwnChecklist();
    setupWorkerOutChecklist();

    setupManualToggle("worker-own-manual-toggle", "worker-own-quick-add");
    setupManualToggle("worker-out-manual-toggle", "worker-out-quick-add");

    setupSimpleList({
        inputId: "worker-own-input",
        addBtnId: "worker-own-add",
        listId: "worker-own-list",
        array: rdoState.workersOwnManual,
        onChange: updateWorkerTotal
    });

    setupSimpleList({
        inputId: "worker-out-input",
        addBtnId: "worker-out-add",
        listId: "worker-out-list",
        array: rdoState.workersOutManual,
        onChange: updateWorkerTotal
    });

    // Equipamentos: cadastro (checklist) + manual (fallback)
    setupEquipmentChecklist();

    setupSimpleList({
        inputId: "equip-op-input",
        addBtnId: "equip-op-add",
        listId: "equip-op-list",
        array: rdoState.equipmentOperatingManual
    });

    setupSimpleList({
        inputId: "equip-stop-input",
        addBtnId: "equip-stop-add",
        listId: "equip-stop-list",
        array: rdoState.equipmentStoppedManual
    });

    // Atividades: estrutura cadastrada + manual (fallback)
    setupActivitySelects();
    setupActivityManual();
    renderActivities();

    setupMaterials();
    renderMaterials();

    setupOccurrences();

    setupPhotos();

    updateWorkerTotal();

    updateProgress();

    updateNavButtons();

    document.getElementById("rdo-back-btn").addEventListener("click", handleBackToObra);

    document.getElementById("btn-back").addEventListener("click", handleBackClick);

    document.getElementById("btn-next").addEventListener("click", handleNextClick);

});
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
            "Execução de alvenaria estrutural no 2º pavimento — Bloco A",
            "Passagem de eletrodutos na laje de cobertura",
            "Limpeza e organização do canteiro"
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

    workersOwn: [],
    workersOut: [],

    equipmentOperating: [],
    equipmentStopped: [],

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

/* Soma o número no início de cada item (ex: "02 Pedreiros" -> 2).
   Se não houver número, conta como 1 trabalhador. */

function countWorkers(list) {

    return list.reduce((total, text) => {
        const match = text.match(/^(\d+)/);
        return total + (match ? Number(match[1]) : 1);
    }, 0);

}

function updateWorkerTotal() {

    const total = countWorkers(rdoState.workersOwn) + countWorkers(rdoState.workersOut);

    document.getElementById("worker-total").textContent =
        String(total).padStart(2, "0");

}

/* ==========================================================
   ATIVIDADES REALIZADAS
========================================================== */

function renderActivities() {

    const list = document.getElementById("activity-list");

    list.innerHTML = "";

    rdoState.activities.forEach((text, index) => {

        const li = document.createElement("li");

        const number = String(index + 1).padStart(2, "0");

        li.innerHTML = `
            <span class="activity-number">${number}</span>
            <span class="activity-text">${text}</span>
            <button class="remove-item-btn" type="button" aria-label="Remover">×</button>
        `;

        li.querySelector(".remove-item-btn").addEventListener("click", () => {
            rdoState.activities.splice(index, 1);
            renderActivities();
        });

        list.appendChild(li);

    });

}

function setupActivities() {

    const input = document.getElementById("activity-input");
    const addBtn = document.getElementById("activity-add");

    function addActivity() {

        const value = input.value.trim();

        if (!value) return;

        rdoState.activities.push(value);

        input.value = "";

        renderActivities();

    }

    addBtn.addEventListener("click", addActivity);

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addActivity();
        }
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

    const totalWorkers = countWorkers(rdoState.workersOwn) + countWorkers(rdoState.workersOut);

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

    rdoState.workersOwn = [...existing.workersOwn];
    rdoState.workersOut = [...existing.workersOut];

    rdoState.equipmentOperating = [...existing.equipmentOperating];
    rdoState.equipmentStopped = [...existing.equipmentStopped];

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

    setupSimpleList({
        inputId: "worker-own-input",
        addBtnId: "worker-own-add",
        listId: "worker-own-list",
        array: rdoState.workersOwn,
        onChange: updateWorkerTotal
    });

    setupSimpleList({
        inputId: "worker-out-input",
        addBtnId: "worker-out-add",
        listId: "worker-out-list",
        array: rdoState.workersOut,
        onChange: updateWorkerTotal
    });

    setupSimpleList({
        inputId: "equip-op-input",
        addBtnId: "equip-op-add",
        listId: "equip-op-list",
        array: rdoState.equipmentOperating
    });

    setupSimpleList({
        inputId: "equip-stop-input",
        addBtnId: "equip-stop-add",
        listId: "equip-stop-list",
        array: rdoState.equipmentStopped
    });

    setupActivities();
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
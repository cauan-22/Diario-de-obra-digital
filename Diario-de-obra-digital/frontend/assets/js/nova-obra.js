/* ==========================================================
   BUILDTRACK
   Arquivo: nova-obra.js
   Descrição: Lógica da página Nova Obra
========================================================== */

/* ==========================================================
   ESTADO DOS SELETORES (status e tipo de registro)
========================================================== */

let selectedStatus = "ativa";
let selectedRegistrationType = "CREA";

function setupChipGroup(groupId, onSelect) {

    const group = document.getElementById(groupId);

    group.querySelectorAll(".chip-option").forEach((button) => {

        button.addEventListener("click", () => {

            group.querySelectorAll(".chip-option").forEach((btn) => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            onSelect(button.dataset.value);

        });

    });

}

/* ==========================================================
   INFORMAÇÕES OPCIONAIS
========================================================== */

function setupOptionalFields() {

    const toggle = document.getElementById("optional-toggle");
    const fields = document.getElementById("optional-fields");

    toggle.addEventListener("click", () => {
        fields.hidden = false;
        toggle.hidden = true;
    });

}

/* ==========================================================
   VALIDAÇÃO
========================================================== */

const requiredFields = [
    { inputId: "obra-name-input", errorId: "error-obra-name" },
    { inputId: "obra-client-input", errorId: "error-obra-client" },
    { inputId: "obra-city-input", errorId: "error-obra-city" },
    { inputId: "obra-state-input", errorId: "error-obra-state" },
    { inputId: "obra-responsible-input", errorId: "error-obra-responsible" },
    { inputId: "obra-registration-number-input", errorId: "error-obra-registration-number" },
    { inputId: "obra-start-date-input", errorId: "error-obra-start-date" }
];

function clearFieldError(inputId, errorId) {

    const input = document.getElementById(inputId);
    const errorMessage = document.getElementById(errorId);

    input.closest(".input-wrapper").classList.remove("field-error");
    errorMessage.closest(".input-group").classList.remove("has-error");

}

function setFieldError(inputId, errorId) {

    const input = document.getElementById(inputId);
    const errorMessage = document.getElementById(errorId);

    input.closest(".input-wrapper").classList.add("field-error");
    errorMessage.closest(".input-group").classList.add("has-error");

}

function validateForm() {

    let firstInvalidInput = null;

    requiredFields.forEach(({ inputId, errorId }) => {

        const input = document.getElementById(inputId);
        const isEmpty = input.value.trim() === "";

        if (isEmpty) {
            setFieldError(inputId, errorId);
            if (!firstInvalidInput) firstInvalidInput = input;
        } else {
            clearFieldError(inputId, errorId);
        }

    });

    return firstInvalidInput;

}

/* Remove o erro assim que o usuário começa a corrigir o campo */

function setupLiveErrorClearing() {

    requiredFields.forEach(({ inputId, errorId }) => {

        document.getElementById(inputId).addEventListener("input", () => {
            clearFieldError(inputId, errorId);
        });

    });

}

/* ==========================================================
   AVISO (TOAST)
========================================================== */

let toastTimeout = null;

function showToast(message) {

    const toast = document.getElementById("nova-obra-toast");

    toast.textContent = message;

    toast.classList.add("visible");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("visible");
    }, 3000);

}

/* ==========================================================
   CRIAÇÃO DA OBRA
========================================================== */

function buildObraFromForm() {

    return {
        name: document.getElementById("obra-name-input").value.trim(),
        client: document.getElementById("obra-client-input").value.trim(),
        contract: document.getElementById("obra-contract-input").value.trim(),
        status: selectedStatus,
        address: document.getElementById("obra-address-input").value.trim(),
        city: document.getElementById("obra-city-input").value.trim(),
        state: document.getElementById("obra-state-input").value.trim().toUpperCase(),
        cep: document.getElementById("obra-cep-input").value.trim(),
        responsible: document.getElementById("obra-responsible-input").value.trim(),
        registrationType: selectedRegistrationType,
        registrationNumber: document.getElementById("obra-registration-number-input").value.trim(),
        startDate: document.getElementById("obra-start-date-input").value,
        expectedEndDate: document.getElementById("obra-end-date-input").value,
        description: document.getElementById("obra-description-input").value.trim(),

        // Campos opcionais
        budget: document.getElementById("obra-budget-input").value.trim(),
        area: document.getElementById("obra-area-input").value.trim(),
        units: document.getElementById("obra-units-input").value.trim(),
        company: document.getElementById("obra-company-input").value.trim(),
        observations: document.getElementById("obra-observations-input").value.trim()
    };

}

async function handleSubmit() {

    const firstInvalidInput = validateForm();

    if (firstInvalidInput) {
        showToast("Preencha os campos obrigatórios destacados.");
        firstInvalidInput.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInvalidInput.focus();
        return;
    }

    const newObra = buildObraFromForm();

    const submitBtn = document.getElementById("submit-btn");

    submitBtn.disabled = true;
    submitBtn.textContent = "Criando...";

    try {

        const obraCriada = await apiFetch("/obras", {
            method: "POST",
            body: JSON.stringify(newObra)
        });

        showToast("Obra criada com sucesso.");

        setTimeout(() => {
            window.location.href = `obra.html?id=${obraCriada.id}`;
        }, 900);

    } catch (error) {

        showToast(error.message);

        submitBtn.disabled = false;
        submitBtn.textContent = "Criar obra";

    }

}

function handleCancel() {

    window.location.href = "home.html";

}

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    requireLogin();

    setupChipGroup("status-group", (value) => { selectedStatus = value; });

    setupChipGroup("registration-type-group", (value) => { selectedRegistrationType = value; });

    setupOptionalFields();

    setupLiveErrorClearing();

    document.getElementById("nova-obra-back-btn").addEventListener("click", handleCancel);

    document.getElementById("cancel-btn").addEventListener("click", handleCancel);

    document.getElementById("submit-btn").addEventListener("click", handleSubmit);

});
/* ==========================================================
   BUILDTRACK
   Arquivo: perfil-editar.js
   Descrição: Lógica da página de Editar Perfil
========================================================== */

/* ==========================================================
   DADOS ATUAIS DO USUÁRIO (futuramente virá do backend)
   Mesmos dados fictícios usados em perfil.js.
========================================================== */

const userData = {
    name: "Cauan Silva",
    email: "cauan@exemplo.com",
    phone: "(47) 99999-0000",
    role: "Engenheiro Civil",
    company: "Construtora Delta",
    crea: "CREA/SC 123456"
};

/* ==========================================================
   PREENCHER O FORMULÁRIO COM OS DADOS ATUAIS
========================================================== */

function fillForm(user) {

    document.getElementById("name-input").value = user.name;
    document.getElementById("email-input").value = user.email;
    document.getElementById("phone-input").value = user.phone;
    document.getElementById("role-input").value = user.role;
    document.getElementById("company-input").value = user.company;
    document.getElementById("crea-input").value = user.crea;

}

/* ==========================================================
   VALIDAÇÃO (mesmo padrão usado em Nova Obra e Cadastro)
========================================================== */

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

function isValidEmail(value) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

}

function validateForm() {

    let firstInvalidInput = null;

    const name = document.getElementById("name-input").value.trim();
    const email = document.getElementById("email-input").value.trim();

    if (name === "") {
        setFieldError("name-input", "error-name");
        firstInvalidInput = document.getElementById("name-input");
    } else {
        clearFieldError("name-input", "error-name");
    }

    if (email === "" || !isValidEmail(email)) {
        setFieldError("email-input", "error-email");
        if (!firstInvalidInput) firstInvalidInput = document.getElementById("email-input");
    } else {
        clearFieldError("email-input", "error-email");
    }

    return firstInvalidInput;

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
    }, 3000);

}

/* ==========================================================
   AÇÕES
========================================================== */

function handleSave() {

    const firstInvalidInput = validateForm();

    if (firstInvalidInput) {
        showToast("Preencha os campos obrigatórios destacados.");
        firstInvalidInput.focus();
        return;
    }

    const updatedUser = {
        name: document.getElementById("name-input").value.trim(),
        email: document.getElementById("email-input").value.trim(),
        phone: document.getElementById("phone-input").value.trim(),
        role: document.getElementById("role-input").value.trim(),
        company: document.getElementById("company-input").value.trim(),
        crea: document.getElementById("crea-input").value.trim()
    };

    // Futuramente: enviar updatedUser para o backend (PUT /usuario).
    console.log("Perfil atualizado:", updatedUser);

    showToast("Perfil atualizado com sucesso.");

    setTimeout(() => {
        window.location.href = "perfil.html";
    }, 900);

}

function handleCancel() {

    window.location.href = "perfil.html";

}

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    fillForm(userData);

    document.getElementById("name-input").addEventListener("input", () => clearFieldError("name-input", "error-name"));
    document.getElementById("email-input").addEventListener("input", () => clearFieldError("email-input", "error-email"));

    document.getElementById("back-btn").addEventListener("click", handleCancel);
    document.getElementById("cancel-btn").addEventListener("click", handleCancel);
    document.getElementById("save-btn").addEventListener("click", handleSave);

});
/* ==========================================================
   BUILDTRACK
   Arquivo: alterar-senha.js
   Descrição: Lógica da página de Alterar Senha
========================================================== */

/* Senha atual fictícia, usada só para simular a checagem.
   Futuramente isso é validado pelo backend, nunca no front. */

const currentPasswordFicticia = "123456";

/* ==========================================================
   MOSTRAR / ESCONDER SENHA
========================================================== */

function setupPasswordToggle(inputId, toggleBtnId) {

    const input = document.getElementById(inputId);
    const toggleBtn = document.getElementById(toggleBtnId);
    const icon = toggleBtn.querySelector(".material-symbols-outlined");

    toggleBtn.addEventListener("click", () => {

        const isPassword = input.type === "password";

        input.type = isPassword ? "text" : "password";

        icon.textContent = isPassword ? "visibility_off" : "visibility";

    });

}

/* ==========================================================
   VALIDAÇÃO
========================================================== */

function clearFieldError(inputId, errorId) {

    const input = document.getElementById(inputId);
    const errorMessage = document.getElementById(errorId);

    input.closest(".input-wrapper").classList.remove("field-error");
    errorMessage.closest(".input-group").classList.remove("has-error");
    errorMessage.textContent = "";

}

function setFieldError(inputId, errorId, message) {

    const input = document.getElementById(inputId);
    const errorMessage = document.getElementById(errorId);

    input.closest(".input-wrapper").classList.add("field-error");
    errorMessage.closest(".input-group").classList.add("has-error");
    errorMessage.textContent = message;

}

function validateForm() {

    const current = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirm = document.getElementById("confirm-password").value;

    let firstInvalidInput = null;

    function fail(inputId, errorId, message) {
        setFieldError(inputId, errorId, message);
        if (!firstInvalidInput) firstInvalidInput = document.getElementById(inputId);
    }

    if (current === "") {
        fail("current-password", "error-current-password", "Digite sua senha atual.");
    } else if (current !== currentPasswordFicticia) {
        fail("current-password", "error-current-password", "Senha atual incorreta.");
    } else {
        clearFieldError("current-password", "error-current-password");
    }

    if (newPassword === "") {
        fail("new-password", "error-new-password", "Digite a nova senha.");
    } else if (newPassword.length < 6) {
        fail("new-password", "error-new-password", "A senha precisa ter pelo menos 6 caracteres.");
    } else {
        clearFieldError("new-password", "error-new-password");
    }

    if (confirm === "") {
        fail("confirm-password", "error-confirm-password", "Confirme a nova senha.");
    } else if (confirm !== newPassword) {
        fail("confirm-password", "error-confirm-password", "As senhas não coincidem.");
    } else {
        clearFieldError("confirm-password", "error-confirm-password");
    }

    return firstInvalidInput;

}

function setupLiveErrorClearing() {

    const fields = [
        ["current-password", "error-current-password"],
        ["new-password", "error-new-password"],
        ["confirm-password", "error-confirm-password"]
    ];

    fields.forEach(([inputId, errorId]) => {
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
        firstInvalidInput.focus();
        return;
    }

    // Futuramente: enviar a nova senha para o backend.
    console.log("Senha alterada com sucesso.");

    showToast("Senha alterada com sucesso.");

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

    setupPasswordToggle("current-password", "current-password-toggle");
    setupPasswordToggle("new-password", "new-password-toggle");
    setupPasswordToggle("confirm-password", "confirm-password-toggle");

    setupLiveErrorClearing();

    document.getElementById("back-btn").addEventListener("click", handleCancel);
    document.getElementById("cancel-btn").addEventListener("click", handleCancel);
    document.getElementById("save-btn").addEventListener("click", handleSave);

});
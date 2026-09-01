/* ==========================================================
   BUILDTRACK
   Arquivo: cadastro.js
   Descrição: Lógica da página de Cadastro
========================================================== */

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

function isValidEmail(value) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

}

function validateForm() {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;

    let firstInvalidInput = null;

    function fail(inputId, errorId, message) {
        setFieldError(inputId, errorId, message);
        if (!firstInvalidInput) firstInvalidInput = document.getElementById(inputId);
    }

    if (name === "") {
        fail("name", "error-name", "Digite seu nome.");
    } else {
        clearFieldError("name", "error-name");
    }

    if (email === "") {
        fail("email", "error-email", "Digite seu e-mail.");
    } else if (!isValidEmail(email)) {
        fail("email", "error-email", "E-mail inválido.");
    } else {
        clearFieldError("email", "error-email");
    }

    if (password === "") {
        fail("password", "error-password", "Digite uma senha.");
    } else if (password.length < 6) {
        fail("password", "error-password", "A senha precisa ter pelo menos 6 caracteres.");
    } else {
        clearFieldError("password", "error-password");
    }

    if (passwordConfirm === "") {
        fail("password-confirm", "error-password-confirm", "Confirme sua senha.");
    } else if (passwordConfirm !== password) {
        fail("password-confirm", "error-password-confirm", "As senhas não coincidem.");
    } else {
        clearFieldError("password-confirm", "error-password-confirm");
    }

    return firstInvalidInput;

}

/* Remove o erro assim que o usuário começa a corrigir o campo */

function setupLiveErrorClearing() {

    const fields = [
        ["name", "error-name"],
        ["email", "error-email"],
        ["password", "error-password"],
        ["password-confirm", "error-password-confirm"]
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

    const toast = document.getElementById("cadastro-toast");

    toast.textContent = message;
    toast.classList.add("visible");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("visible");
    }, 3000);

}

/* ==========================================================
   ENVIO DO FORMULÁRIO
========================================================== */

async function handleSubmit(event) {

    event.preventDefault();

    const firstInvalidInput = validateForm();

    if (firstInvalidInput) {
        firstInvalidInput.focus();
        return;
    }

    const newUser = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value
    };

    const submitBtn = document.querySelector("#cadastro-form .btn");

    submitBtn.disabled = true;
    submitBtn.textContent = "CRIANDO CONTA...";

    try {

        await apiFetch("/usuarios/cadastro", {
            method: "POST",
            body: JSON.stringify(newUser)
        });

        showToast("Conta criada com sucesso. Redirecionando para o login...");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);

    } catch (error) {

        showToast(error.message);

        submitBtn.disabled = false;
        submitBtn.textContent = "CRIAR CONTA";

    }

}

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    setupPasswordToggle("password", "password-toggle");
    setupPasswordToggle("password-confirm", "password-confirm-toggle");

    setupLiveErrorClearing();

    document
        .getElementById("cadastro-form")
        .addEventListener("submit", handleSubmit);

});
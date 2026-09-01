/* ==========================================================
   BUILDTRACK
   Arquivo: login.js
   Descrição: Lógica da tela de Login.
========================================================== */

/* ==========================================================
   MOSTRAR / ESCONDER SENHA
========================================================== */

function setupPasswordToggle() {

    const toggleBtn = document.getElementById("password-toggle");
    const input = document.getElementById("password");
    const icon = toggleBtn.querySelector(".material-symbols-outlined");

    toggleBtn.addEventListener("click", () => {

        const isPassword = input.type === "password";

        input.type = isPassword ? "text" : "password";
        icon.textContent = isPassword ? "visibility_off" : "visibility";

    });

}

/* ==========================================================
   MENSAGEM DE ERRO
   O login.html não tem um elemento de erro pronto, então
   criamos um na primeira vez que for preciso mostrar algo.
========================================================== */

function showError(message) {

    let errorEl = document.getElementById("login-error");

    if (!errorEl) {

        errorEl = document.createElement("p");
        errorEl.id = "login-error";
        errorEl.style.color = "#C62828";
        errorEl.style.fontSize = "13px";
        errorEl.style.textAlign = "center";
        errorEl.style.marginTop = "-6px";

        document.querySelector(".login-form").appendChild(errorEl);

    }

    errorEl.textContent = message;

}

function clearError() {

    const errorEl = document.getElementById("login-error");

    if (errorEl) errorEl.textContent = "";

}

/* ==========================================================
   ENVIO DO FORMULÁRIO
========================================================== */

async function handleLogin(event) {

    event.preventDefault();

    clearError();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showError("Preencha e-mail e senha.");
        return;
    }

    const submitBtn = document.querySelector(".login-form .btn");

    submitBtn.disabled = true;
    submitBtn.textContent = "ENTRANDO...";

    try {

        const data = await apiFetch("/usuarios/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        // Guarda o token e os dados do usuário pro resto do app usar.
        setToken(data.token);
        setStoredUser(data.user);

        window.location.href = "home.html";

    } catch (error) {

        showError(error.message);

        submitBtn.disabled = false;
        submitBtn.textContent = "ENTRAR";

    }

}

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    setupPasswordToggle();

    document
        .querySelector(".login-form")
        .addEventListener("submit", handleLogin);

});
/* ==========================================================
   BUILDTRACK
   Arquivo: login.js
   Descrição: Lógica da tela de login
========================================================== */

const passwordInput = document.querySelector("#password");
const passwordToggle = document.querySelector("#password-toggle");
const loginForm = document.querySelector(".login-form");

// ==========================================================
// MOSTRAR / OCULTAR SENHA
// ==========================================================

passwordToggle.addEventListener("click", () => {

    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword
        ? "text"
        : "password";

    passwordToggle.setAttribute(
        "aria-label",
        isPassword
            ? "Ocultar senha"
            : "Mostrar senha"
    );

    passwordToggle.querySelector("span").textContent =
        isPassword
            ? "visibility_off"
            : "visibility";

});

// ==========================================================
// LOGIN TEMPORÁRIO
// ==========================================================

loginForm.addEventListener("submit", (event) => {

    event.preventDefault();

    window.location.href = "home.html";

});
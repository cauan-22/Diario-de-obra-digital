/* ==========================================================
   BUILDTRACK
   Arquivo: perfil.js
   Descrição: Lógica da página de Perfil
========================================================== */

/* ==========================================================
   DADOS FICTÍCIOS (futuramente virão do backend)
========================================================== */

const userData = {
    name: "Cauan Silva",
    email: "cauan@exemplo.com",
    phone: "(47) 99999-0000",
    role: "Engenheiro Civil",
    company: "Construtora Delta",
    crea: "CREA/SC 123456",
    memberSince: "MAR 2026",
    stats: {
        activeObras: 2,
        totalRDOs: 37
    }
};

/* ==========================================================
   INICIAIS DO NOME (para o "crachá")
========================================================== */

function getInitials(fullName) {

    const parts = fullName.trim().split(" ").filter(Boolean);

    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

    return (first + last).toUpperCase();

}

/* ==========================================================
   RENDERIZAÇÃO
========================================================== */

function renderProfile(user) {

    document.getElementById("perfil-avatar").textContent = getInitials(user.name);

    document.getElementById("perfil-name").textContent = user.name;
    document.getElementById("perfil-role").textContent = `${user.role} · ${user.company}`;

    document.getElementById("info-name").textContent = user.name;
    document.getElementById("info-email").textContent = user.email;
    document.getElementById("info-phone").textContent = user.phone;

    document.getElementById("info-role").textContent = user.role;
    document.getElementById("info-company").textContent = user.company;
    document.getElementById("info-crea").textContent = user.crea;

    document.getElementById("stat-active-obras").textContent =
        String(user.stats.activeObras).padStart(2, "0");

    document.getElementById("stat-total-rdos").textContent = user.stats.totalRDOs;

    document.getElementById("stat-member-since").textContent = user.memberSince;

}

/* ==========================================================
   AVISO (TOAST)
========================================================== */

let toastTimeout = null;

function showToast(message) {

    const toast = document.getElementById("perfil-toast");

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

function handleLogout() {

    // Futuramente: encerrar a sessão de verdade no backend.
    window.location.href = "login.html";

}

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    renderProfile(userData);

    document
        .getElementById("action-edit-profile")
        .addEventListener("click", () => { window.location.href = "perfil-editar.html"; });

    document
        .getElementById("action-change-password")
        .addEventListener("click", () => { window.location.href = "alterar-senha.html"; });

    document
        .getElementById("action-logout")
        .addEventListener("click", handleLogout);

});
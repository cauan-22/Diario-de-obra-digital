/* ==========================================================
   BUILDTRACK
   Arquivo: perfil.js
   Descrição: Lógica da página de Perfil
========================================================== */

/* ==========================================================
   INICIAIS DO NOME (para o "crachá")
========================================================== */

function getInitials(fullName) {

    const parts = fullName.trim().split(" ").filter(Boolean);

    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

    return (first + last).toUpperCase();

}

function formatMonthYear(isoDate) {

    if (!isoDate) return "—";

    const date = new Date(isoDate);

    const months = [
        "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
        "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
    ];

    return `${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

}

/* ==========================================================
   RENDERIZAÇÃO
========================================================== */

function renderProfile(user, obras) {

    document.getElementById("perfil-avatar").textContent = getInitials(user.name);

    document.getElementById("perfil-name").textContent = user.name;

    const cargoEmpresa = [user.role, user.company].filter(Boolean).join(" · ");
    document.getElementById("perfil-role").textContent = cargoEmpresa || "—";

    document.getElementById("info-name").textContent = user.name;
    document.getElementById("info-email").textContent = user.email;
    document.getElementById("info-phone").textContent = user.phone || "—";

    document.getElementById("info-role").textContent = user.role || "—";
    document.getElementById("info-company").textContent = user.company || "—";

    document.getElementById("info-crea").textContent =
        user.registration_type ? `${user.registration_type} ${user.registration_number || ""}`.trim() : "—";

    const activeObras = obras.filter((o) => o.status === "ativa").length;
    const totalRDOs = obras.reduce((sum, o) => sum + Number(o.rdo_count || 0), 0);

    document.getElementById("stat-active-obras").textContent = String(activeObras).padStart(2, "0");
    document.getElementById("stat-total-rdos").textContent = totalRDOs;
    document.getElementById("stat-member-since").textContent = formatMonthYear(user.created_at);

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
   CARREGAR DADOS DO BACKEND
========================================================== */

async function loadPerfil() {

    try {

        const [user, obras] = await Promise.all([
            apiFetch("/usuarios/perfil"),
            apiFetch("/obras")
        ]);

        // Mantém o localStorage sincronizado também, já que outras
        // telas (como a saudação da Home) usam esse valor guardado.
        setStoredUser(user);

        renderProfile(user, obras);

    } catch (error) {
        showToast(`Erro ao carregar o perfil: ${error.message}`);
    }

}

/* ==========================================================
   AÇÕES
========================================================== */

function handleLogout() {

    logout();

}

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    requireLogin();

    loadPerfil();

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
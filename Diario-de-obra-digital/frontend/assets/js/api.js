/* ==========================================================
   BUILDTRACK
   Arquivo: api.js
   Descrição: Funções compartilhadas para conversar com o
   backend. Toda página que precisa buscar ou salvar dados
   de verdade inclui este arquivo ANTES do seu próprio .js.

   Se um dia o backend for hospedado em outro endereço (não
   mais no seu computador), só precisa trocar essa constante.
========================================================== */

const API_BASE_URL = "http://localhost:3000";

/* ==========================================================
   TOKEN DE LOGIN
   Guardado no navegador (localStorage), continua ali mesmo
   se a pessoa fechar a aba e voltar depois.
========================================================== */

function getToken() {
    return localStorage.getItem("buildtrack_token");
}

function setToken(token) {
    localStorage.setItem("buildtrack_token", token);
}

function clearToken() {
    localStorage.removeItem("buildtrack_token");
}

function getStoredUser() {
    const raw = localStorage.getItem("buildtrack_user");
    return raw ? JSON.parse(raw) : null;
}

function setStoredUser(user) {
    localStorage.setItem("buildtrack_user", JSON.stringify(user));
}

function isLoggedIn() {
    return Boolean(getToken());
}

function logout() {
    clearToken();
    localStorage.removeItem("buildtrack_user");
    window.location.href = "login.html";
}

/* ==========================================================
   requireLogin()
   Chame no topo de páginas que só fazem sentido logado.
   Se não tiver token, manda direto pro login.
========================================================== */

function requireLogin() {

    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }

}

/* ==========================================================
   apiFetch()
   Função central: monta a URL completa, adiciona o token
   (se tiver um) e já trata erro de forma consistente.

   Uso:
   const obras = await apiFetch("/obras");
   const nova  = await apiFetch("/obras", { method: "POST", body: JSON.stringify(dados) });
========================================================== */

async function apiFetch(path, options = {}) {

    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    const token = getToken();

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    let response;

    try {

        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers
        });

    } catch (networkError) {
        // Acontece quando o backend não está rodando, ou a URL está errada.
        throw new Error("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
    }

    // 204 = sucesso sem corpo de resposta (ex: DELETE)
    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = (data && data.error) || "Erro ao comunicar com o servidor.";
        throw new Error(message);
    }

    return data;

}
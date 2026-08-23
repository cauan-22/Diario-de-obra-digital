/* ==========================================================
   BUILDTRACK
   Arquivo: rdo-detalhes.js
   Descrição: Lógica da página Detalhes do RDO (somente leitura)
========================================================== */

/* ==========================================================
   PLACEHOLDER DE FOTO
   Como ainda não existem fotos reais, geramos uma imagem
   simples em SVG (sem depender de internet ou arquivos extras).
========================================================== */

function createPlaceholderPhoto(label) {

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
            <rect width="300" height="300" fill="#1F1F1F"/>
            <rect width="300" height="6" y="0" fill="#F4B400"/>
            <text x="20" y="270" fill="#F2F1ED" font-family="Manrope, sans-serif"
                font-size="16" font-weight="700">${label}</text>
        </svg>
    `;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

}

/* ==========================================================
   DADOS FICTÍCIOS (futuramente virão do backend)
   Chave: "obraId-rdoId"
========================================================== */

const rdoDetailsDatabase = {

    "1-12": {
        id: 12,
        obraId: 1,
        obraName: "Casa Jardim",
        obraCity: "Porto Belo / SC",
        date: "20 AGO 2026",
        weekday: "Quinta-feira",
        responsible: "Eng. Carlos Mendes",
        crea: "CREA/SC 123456",
        registeredAt: { date: "20 AGO 2026", time: "17:42" },

        weather: {
            manha: "Bom",
            tarde: "Chuvoso",
            impact: "Perda de aproximadamente 2 horas de trabalho devido à chuva."
        },

        workersOwn: [
            "01 Engenheiro",
            "01 Mestre de Obra",
            "02 Pedreiros"
        ],

        workersOut: [
            "03 Eletricistas — Empresa X",
            "02 Pintores — Empresa Y"
        ],

        equipmentOperating: [
            "01 Betoneira",
            "01 Mini Escavadeira"
        ],

        equipmentStopped: [
            "01 Andaime — aguardando montagem"
        ],

        activities: [
            "Execução de alvenaria estrutural no 2º pavimento — Bloco A",
            "Passagem de eletrodutos na laje de cobertura",
            "Limpeza e organização do canteiro"
        ],

        materials: [
            { name: "50 sacos de cimento", fornecedor: "Empresa X", nf: "12345" },
            { name: "06 m³ de areia média", fornecedor: "Empresa Y", nf: "12346" }
        ],

        tests: "Coleta de corpo de prova para teste do concreto.",

        occurrences: [
            "Atraso na entrega do aço por parte do fornecedor. A atividade de armação foi reprogramada para amanhã."
        ],

        photos: [
            { label: "Foto 01", caption: "Alvenaria do segundo pavimento" },
            { label: "Foto 02", caption: "Material recebido no canteiro" },
            { label: "Foto 03", caption: "Fachada frontal em construção" },
            { label: "Foto 04", caption: "Equipe finalizando o expediente" }
        ],

        observations: "Serviços executados conforme planejamento. Equipe manteve o ritmo previsto durante o período da manhã."
    }

};

/* ==========================================================
   BUSCAR RDO PELA URL
   Ex: rdo-detalhes.html?obra=1&rdo=12
   Futuramente esta função fará uma chamada ao backend.
========================================================== */

function getRDOFromURL() {

    const params = new URLSearchParams(window.location.search);

    const obraId = Number(params.get("obra")) || 1;
    const rdoId = Number(params.get("rdo")) || 12;

    const key = `${obraId}-${rdoId}`;

    return rdoDetailsDatabase[key] || rdoDetailsDatabase["1-12"];

}

/* ==========================================================
   SOMA DE TRABALHADORES
========================================================== */

function countWorkers(list) {

    return list.reduce((total, text) => {
        const match = text.match(/^(\d+)/);
        return total + (match ? Number(match[1]) : 1);
    }, 0);

}

/* ==========================================================
   RENDERIZAÇÃO — IDENTIFICAÇÃO E RESUMO
========================================================== */

function renderIdentification(rdo) {

    document.getElementById("rdo-id-number").textContent =
        `Nº ${String(rdo.id).padStart(3, "0")}`;

    document.getElementById("rdo-id-date").textContent = rdo.date;
    document.getElementById("rdo-id-weekday").textContent = rdo.weekday;

    document.getElementById("info-obra-name").textContent = rdo.obraName;
    document.getElementById("info-obra-city").textContent = rdo.obraCity;

    document.getElementById("info-responsible").textContent = rdo.responsible;
    document.getElementById("info-crea").textContent = rdo.crea;

    document.getElementById("registered-date").textContent = rdo.registeredAt.date;
    document.getElementById("registered-time").textContent = rdo.registeredAt.time;

}

function renderSummary(rdo) {

    const totalWorkers = countWorkers(rdo.workersOwn) + countWorkers(rdo.workersOut);

    document.getElementById("summary-workers").textContent =
        String(totalWorkers).padStart(2, "0");

    document.getElementById("summary-activities").textContent =
        String(rdo.activities.length).padStart(2, "0");

    document.getElementById("summary-materials").textContent =
        String(rdo.materials.length).padStart(2, "0");

    document.getElementById("summary-occurrences").textContent =
        String(rdo.occurrences.length).padStart(2, "0");

    document.getElementById("summary-photos").textContent =
        String(rdo.photos.length).padStart(2, "0");

}

/* ==========================================================
   RENDERIZAÇÃO — CONDIÇÕES CLIMÁTICAS
========================================================== */

function renderWeather(rdo) {

    document.getElementById("weather-manha").textContent = rdo.weather.manha;
    document.getElementById("weather-tarde").textContent = rdo.weather.tarde;
    document.getElementById("weather-impact").textContent = rdo.weather.impact;

}

/* ==========================================================
   RENDERIZAÇÃO — LISTAS SIMPLES (mão de obra, equipamentos)
========================================================== */

function renderSimpleList(listId, items) {

    const list = document.getElementById(listId);

    list.innerHTML = "";

    items.forEach((text) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${text}</span>`;
        list.appendChild(li);
    });

}

function renderWorkforce(rdo) {

    renderSimpleList("workers-own-list", rdo.workersOwn);
    renderSimpleList("workers-out-list", rdo.workersOut);

    const total = countWorkers(rdo.workersOwn) + countWorkers(rdo.workersOut);

    document.getElementById("workers-total").textContent =
        `${String(total).padStart(2, "0")} trabalhadores`;

}

function renderEquipment(rdo) {

    renderSimpleList("equipment-operating-list", rdo.equipmentOperating);
    renderSimpleList("equipment-stopped-list", rdo.equipmentStopped);

}

/* ==========================================================
   RENDERIZAÇÃO — ATIVIDADES
========================================================== */

function renderActivities(rdo) {

    const list = document.getElementById("activities-list");

    list.innerHTML = "";

    rdo.activities.forEach((text, index) => {

        const li = document.createElement("li");

        const number = String(index + 1).padStart(2, "0");

        li.innerHTML = `
            <span class="activity-number">${number}</span>
            <span class="activity-text">${text}</span>
        `;

        list.appendChild(li);

    });

}

/* ==========================================================
   RENDERIZAÇÃO — MATERIAIS
========================================================== */

function renderMaterials(rdo) {

    const list = document.getElementById("materials-list");

    list.innerHTML = "";

    rdo.materials.forEach((material) => {

        const li = document.createElement("li");

        li.innerHTML = `
            <div class="material-item-top">
                <strong>${material.name}</strong>
            </div>
            <div class="material-item-details">
                ${material.fornecedor} · NF ${material.nf}
            </div>
        `;

        list.appendChild(li);

    });

    const testsBlock = document.getElementById("tests-block");

    if (rdo.tests) {
        document.getElementById("tests-text").textContent = rdo.tests;
        testsBlock.hidden = false;
    } else {
        testsBlock.hidden = true;
    }

}

/* ==========================================================
   RENDERIZAÇÃO — OCORRÊNCIAS
========================================================== */

function renderOccurrences(rdo) {

    const text = document.getElementById("occurrences-text");

    if (rdo.occurrences.length === 0) {
        text.textContent = "Sem ocorrências registradas.";
    } else {
        text.textContent = rdo.occurrences.join(" ");
    }

}

/* ==========================================================
   RENDERIZAÇÃO — FOTOS (GALERIA + LIGHTBOX)
========================================================== */

function renderPhotos(rdo) {

    const gallery = document.getElementById("photo-gallery");

    gallery.innerHTML = "";

    rdo.photos.forEach((photo) => {

        const imageSrc = createPlaceholderPhoto(photo.label);

        const item = document.createElement("div");

        item.className = "photo-gallery-item";

        item.innerHTML = `
            <img src="${imageSrc}" alt="${photo.caption}">
            <div class="photo-gallery-item-label">${photo.label}</div>
            <div class="photo-gallery-item-caption">${photo.caption}</div>
        `;

        item.addEventListener("click", () => openLightbox(imageSrc, photo.caption));

        gallery.appendChild(item);

    });

}

function openLightbox(imageSrc, caption) {

    document.getElementById("photo-lightbox-img").src = imageSrc;
    document.getElementById("photo-lightbox-caption").textContent = caption;
    document.getElementById("photo-lightbox").hidden = false;

}

function closeLightbox() {

    document.getElementById("photo-lightbox").hidden = true;

}

/* ==========================================================
   RENDERIZAÇÃO — OBSERVAÇÕES
========================================================== */

function renderObservations(rdo) {

    document.getElementById("observations-text").textContent =
        rdo.observations || "Nenhuma observação registrada.";

}

/* ==========================================================
   AVISO (TOAST)
========================================================== */

let toastTimeout = null;

function showToast(message) {

    const toast = document.getElementById("rdo-detalhes-toast");

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

function handleBack(rdo) {

    window.location.href = `obra.html?id=${rdo.obraId}`;

}

function handleEdit(rdo) {

    window.location.href = `rdo.html?obraId=${rdo.obraId}&rdoId=${rdo.id}`;

}

function handleGeneratePDF() {

    // Futuramente: gerar o PDF de verdade a partir dos dados do RDO
    showToast("Gerando PDF... (em breve)");

}

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const rdo = getRDOFromURL();

    renderIdentification(rdo);
    renderSummary(rdo);
    renderWeather(rdo);
    renderWorkforce(rdo);
    renderEquipment(rdo);
    renderActivities(rdo);
    renderMaterials(rdo);
    renderOccurrences(rdo);
    renderPhotos(rdo);
    renderObservations(rdo);

    document
        .getElementById("rdo-detalhes-back-btn")
        .addEventListener("click", () => handleBack(rdo));

    document
        .getElementById("edit-rdo-btn")
        .addEventListener("click", () => handleEdit(rdo));

    document
        .getElementById("generate-pdf-btn")
        .addEventListener("click", handleGeneratePDF);

    document
        .getElementById("photo-lightbox-close")
        .addEventListener("click", closeLightbox);

    document
        .getElementById("photo-lightbox")
        .addEventListener("click", (event) => {
            if (event.target.id === "photo-lightbox") closeLightbox();
        });

});
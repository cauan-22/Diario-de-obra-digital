/* ==========================================================
   BUILDTRACK
   Arquivo: acompanhamento.js
   Descrição: Lógica da aba "Acompanhamento" dentro da tela de Obra

   IMPORTANTE: os dados de "quanto foi feito em cada dia" (dias
   trabalhados e quantidade realizada) ainda são fictícios aqui.
   Isso porque o RDO real ainda não pergunta "quanto você fez
   dessa atividade hoje" — isso é um passo futuro. Por enquanto,
   simulamos esse histórico pra já poder montar o gráfico.
========================================================== */

/* ==========================================================
   DADOS FICTÍCIOS DE PROGRESSO
   Espelha os IDs de etapas/atividades usados em estrutura.js,
   pra ficar consistente entre as duas telas.
========================================================== */

const progressoPorObra = {

    1: {

        startDate: "2026-08-05",
        expectedEndDate: "2026-12-20",

        etapas: [
            {
                id: 1,
                name: "Estruturas",
                prazoDias: 25,
                atividades: [
                    { id: 1, name: "Execução de formas", prazoDias: 8, quantidadeTotal: 120, unidade: "m²", finalizada: false },
                    { id: 2, name: "Montagem de armaduras", prazoDias: 5, quantidadeTotal: null, unidade: null, finalizada: false },
                    { id: 3, name: "Concretagem", prazoDias: null, quantidadeTotal: null, unidade: null, finalizada: true },
                    { id: 4, name: "Escavação", prazoDias: null, quantidadeTotal: null, unidade: null, finalizada: true },
                    { id: 5, name: "Montagem de armaduras", prazoDias: null, quantidadeTotal: null, unidade: null, finalizada: false },
                    { id: 6, name: "Concretagem", prazoDias: null, quantidadeTotal: null, unidade: null, finalizada: false }
                ]
            },
            {
                id: 2,
                name: "Alvenaria",
                prazoDias: null,
                atividades: []
            }
        ],

        // Cada linha representa "no dia X, foi feito Y dessa atividade"
        rdoEntries: [
            { date: "2026-08-10", atividadeId: 1, quantidade: 30 },
            { date: "2026-08-11", atividadeId: 1, quantidade: 25 },
            { date: "2026-08-12", atividadeId: 1, quantidade: 20 },
            { date: "2026-08-13", atividadeId: 2, quantidade: null },
            { date: "2026-08-14", atividadeId: 2, quantidade: null },
            { date: "2026-08-15", atividadeId: 2, quantidade: null },
            { date: "2026-08-18", atividadeId: 2, quantidade: null },
            { date: "2026-08-19", atividadeId: 2, quantidade: null },
            { date: "2026-08-20", atividadeId: 2, quantidade: null }
        ]

    }

};

/* ==========================================================
   FORMATAÇÃO
========================================================== */

function formatDateSimplesBR(isoDate) {

    const [year, month, day] = isoDate.split("-");

    return `${day}/${month}/${year}`;

}

function diasEntre(dataInicial, dataFinal) {

    const msPorDia = 1000 * 60 * 60 * 24;

    return Math.round((dataFinal - dataInicial) / msPorDia);

}

/* ==========================================================
   PROGRESSO GERAL DA OBRA (baseado em tempo)
========================================================== */

function computeObraProgress(ctx) {

    const start = new Date(ctx.startDate);
    const end = new Date(ctx.expectedEndDate);
    const today = new Date();

    const totalDays = diasEntre(start, end);
    const elapsedDaysRaw = diasEntre(start, today);

    const percentRaw = totalDays > 0 ? (elapsedDaysRaw / totalDays) * 100 : 0;
    const percent = Math.min(100, Math.max(0, percentRaw));

    const overdueDays = elapsedDaysRaw > totalDays ? elapsedDaysRaw - totalDays : 0;

    return { percent: Math.round(percent), overdueDays, totalDays };

}

/* ==========================================================
   PROGRESSO DE UMA ATIVIDADE
   Prioridade: finalizada > quantidade > dias > sem meta
========================================================== */

function computeAtividadeProgress(ctx, atividade) {

    const entries = ctx.rdoEntries.filter((e) => e.atividadeId === atividade.id);

    // 1) Se foi marcada como concluída, força 100% e mostra a
    //    antecedência (ou atraso) em relação ao prazo em dias.

    if (atividade.finalizada) {

        if (!atividade.prazoDias) {
            return { mode: "finalizada", percent: 100, message: "Concluída." };
        }

        const diasUsados = new Set(entries.map((e) => e.date)).size;
        const diferenca = atividade.prazoDias - diasUsados;

        let message;

        if (diferenca > 0) {
            message = `Concluída com ${diferenca} dia${diferenca > 1 ? "s" : ""} de antecedência.`;
        } else if (diferenca < 0) {
            message = `Concluída, ${Math.abs(diferenca)} dia${Math.abs(diferenca) > 1 ? "s" : ""} além do prazo.`;
        } else {
            message = "Concluída no prazo previsto.";
        }

        return { mode: "finalizada", percent: 100, message };

    }

    // 2) Se tem meta de quantidade, essa é mais precisa que dias.

    if (atividade.quantidadeTotal) {

        const feito = entries.reduce((soma, e) => soma + (e.quantidade || 0), 0);

        const percent = Math.min(100, (feito / atividade.quantidadeTotal) * 100);

        return {
            mode: "quantidade",
            percent: Math.round(percent),
            message: `${feito}/${atividade.quantidadeTotal} ${atividade.unidade} · ${Math.round(percent)}%`
        };

    }

    // 3) Sem quantidade, mas com prazo em dias.

    if (atividade.prazoDias) {

        const dias = new Set(entries.map((e) => e.date)).size;

        const percent = Math.min(100, (dias / atividade.prazoDias) * 100);
        const overdueDays = dias > atividade.prazoDias ? dias - atividade.prazoDias : 0;

        const message = overdueDays > 0
            ? `${dias}/${atividade.prazoDias} dias · 100% · ${overdueDays} dia${overdueDays > 1 ? "s" : ""} atrasado`
            : `${dias}/${atividade.prazoDias} dias · ${Math.round(percent)}%`;

        return { mode: "dias", percent: Math.round(percent), overdueDays, message };

    }

    // 4) Sem nenhuma meta definida.

    return null;

}

/* ==========================================================
   PROGRESSO DE UMA ETAPA (sempre por dias, olhando as
   atividades dentro dela — quantidade é só no nível de atividade)
========================================================== */

function computeEtapaProgress(ctx, etapa) {

    if (!etapa.prazoDias) return null;

    const atividadeIds = new Set(etapa.atividades.map((a) => a.id));

    const dias = new Set(
        ctx.rdoEntries
            .filter((e) => atividadeIds.has(e.atividadeId))
            .map((e) => e.date)
    ).size;

    const percent = Math.min(100, (dias / etapa.prazoDias) * 100);
    const overdueDays = dias > etapa.prazoDias ? dias - etapa.prazoDias : 0;

    const message = overdueDays > 0
        ? `${dias}/${etapa.prazoDias} dias · 100% · ${overdueDays} dia${overdueDays > 1 ? "s" : ""} atrasado`
        : `${dias}/${etapa.prazoDias} dias · ${Math.round(percent)}%`;

    return { percent: Math.round(percent), overdueDays, message };

}

/* ==========================================================
   RENDERIZAÇÃO
========================================================== */

function renderProgressBar(progress) {

    if (!progress) {
        return `<p class="progress-no-deadline">Sem prazo ou quantidade definida.</p>`;
    }

    let fillClass = "progress-fill";

    if (progress.mode === "finalizada") fillClass += " progress-fill--done";
    else if (progress.overdueDays > 0) fillClass += " progress-fill--overdue";

    return `
        <div class="progress-track">
            <div class="${fillClass}" style="width:${progress.percent}%"></div>
        </div>
        <p class="progress-item-meta">${progress.message}</p>
    `;

}

function renderObraProgress(ctx) {

    const progress = computeObraProgress(ctx);

    document.getElementById("obra-progress-percent").textContent =
        progress.overdueDays > 0 ? "100%" : `${progress.percent}%`;

    const fill = document.getElementById("obra-progress-fill");

    fill.style.width = `${progress.percent}%`;
    fill.classList.toggle("progress-fill--overdue", progress.overdueDays > 0);

    const meta = document.getElementById("obra-progress-meta");

    meta.textContent = progress.overdueDays > 0
        ? `Início: ${formatDateSimplesBR(ctx.startDate)} · Previsão: ${formatDateSimplesBR(ctx.expectedEndDate)} · ${progress.overdueDays} dia${progress.overdueDays > 1 ? "s" : ""} além da previsão`
        : `Início: ${formatDateSimplesBR(ctx.startDate)} · Previsão: ${formatDateSimplesBR(ctx.expectedEndDate)}`;

}

function renderEtapasProgress(ctx) {

    const list = document.getElementById("etapas-progress-list");
    const emptyState = document.getElementById("progress-empty-state");

    list.innerHTML = "";

    const etapasComMeta = ctx.etapas.filter((etapa) =>
        etapa.prazoDias || etapa.atividades.some((a) => a.prazoDias || a.quantidadeTotal || a.finalizada)
    );

    emptyState.hidden = etapasComMeta.length > 0;

    etapasComMeta.forEach((etapa) => {

        const etapaProgress = computeEtapaProgress(ctx, etapa);

        const atividadesComMeta = etapa.atividades.filter((a) =>
            a.prazoDias || a.quantidadeTotal || a.finalizada
        );

        const block = document.createElement("div");

        block.className = "progress-etapa-block";

        const etapaPercentLabel = etapaProgress
            ? (etapaProgress.overdueDays > 0 ? "100%" : `${etapaProgress.percent}%`)
            : "—";

        block.innerHTML = `
            <div class="progress-item-header">
                <span class="progress-item-name">${etapa.name}</span>
                <span class="progress-item-percent">${etapaPercentLabel}</span>
            </div>
            ${renderProgressBar(etapaProgress)}
        `;

        if (atividadesComMeta.length > 0) {

            const toggle = document.createElement("button");

            toggle.className = "progress-toggle-btn";
            toggle.type = "button";
            toggle.textContent = "Ver atividades";

            const atividadesContainer = document.createElement("div");

            atividadesContainer.className = "progress-atividades-list";

            atividadesComMeta.forEach((atividade) => {

                const atvProgress = computeAtividadeProgress(ctx, atividade);

                const atvPercentLabel = atvProgress
                    ? (atvProgress.mode === "finalizada" || atvProgress.overdueDays > 0 ? "100%" : `${atvProgress.percent}%`)
                    : "—";

                const atvBlock = document.createElement("div");

                atvBlock.className = "progress-atividade-block";

                atvBlock.innerHTML = `
                    <div class="progress-item-header">
                        <span class="progress-item-name progress-item-name--small">${atividade.name}</span>
                        <span class="progress-item-percent progress-item-percent--small">${atvPercentLabel}</span>
                    </div>
                    ${renderProgressBar(atvProgress)}
                `;

                atividadesContainer.appendChild(atvBlock);

            });

            toggle.addEventListener("click", () => {

                const isOpen = atividadesContainer.classList.toggle("expanded");

                toggle.textContent = isOpen ? "Ocultar atividades" : "Ver atividades";

            });

            block.appendChild(toggle);
            block.appendChild(atividadesContainer);

        }

        list.appendChild(block);

    });

}

/* ==========================================================
   ABAS (Diário / Acompanhamento)
========================================================== */

function setupTabs() {

    const buttons = document.querySelectorAll(".obra-tab-btn");

    buttons.forEach((button) => {

        button.addEventListener("click", () => {

            buttons.forEach((b) => b.classList.remove("active"));
            button.classList.add("active");

            document.querySelectorAll(".obra-tab-panel").forEach((panel) => {
                panel.hidden = panel.dataset.panel !== button.dataset.tab;
            });

            // Atualiza o nome da obra no momento de abrir a aba — assim
            // já pega o nome real, que só chega depois da busca no backend.
            if (button.dataset.tab === "acompanhamento") {
                document.getElementById("obra-progress-name").textContent =
                    document.getElementById("obra-name").textContent;
            }

        });

    });

}

/* ==========================================================
   INICIALIZAÇÃO

   IMPORTANTE: os dados de progresso (etapas, prazos, quantidade
   realizada) continuam fictícios por enquanto — essa parte só
   fica real quando o RDO passar a registrar as atividades
   ligadas à Estrutura da obra (próximo passo do projeto).
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    setupTabs();

    const obraId = getObraIdFromURL();

    const ctx = progressoPorObra[obraId] || progressoPorObra[1];

    renderObraProgress(ctx);
    renderEtapasProgress(ctx);

});
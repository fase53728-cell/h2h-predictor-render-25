// ============================
// CONFIG
// ============================
const API_BASE = "https://h2h-fastapi-backend.onrender.com/api";

// ============================
// ALERTA SIMPLES
// ============================
function showAlert(msg) {
    alert(msg);
}

// ============================
// ACORDEÃO (COMPATÍVEL COM SEU CSS)
// ============================
document.addEventListener("click", (e) => {
    if (e.target.closest(".collapsible .card-header")) {
        const card = e.target.closest(".collapsible");
        const body = card.querySelector(".card-body");
        const arrow = card.querySelector(".arrow");

        const isOpen = body.style.display === "block";

        body.style.display = isOpen ? "none" : "block";
        arrow.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
    }
});

// ============================
// CARREGAR LIGAS
// ============================
async function carregarLigas() {
    try {
        const res = await fetch(`${API_BASE}/leagues`);
        const data = await res.json();

        const sel = document.getElementById("selectLiga");
        const selImport = document.getElementById("selectLigaImport");

        sel.innerHTML = `<option value="">Selecione...</option>`;
        selImport.innerHTML = `<option value="">Selecione...</option>`;

        data.forEach(lg => {
            sel.innerHTML += `<option value="${lg.league_id}">${lg.name}</option>`;
            selImport.innerHTML += `<option value="${lg.league_id}">${lg.name}</option>`;
        });
    } catch (err) {
        console.error(err);
        showAlert("Erro ao carregar ligas.");
    }
}

// ============================
// CARREGAR TIMES
// ============================
async function carregarTimes(leagueId) {
    if (!leagueId) return;

    const res = await fetch(`${API_BASE}/leagues/${leagueId}/teams`);
    const data = await res.json();

    const selHome = document.getElementById("selectMandante");
    const selAway = document.getElementById("selectVisitante");

    selHome.innerHTML = `<option value="">Selecione...</option>`;
    selAway.innerHTML = `<option value="">Selecione...</option>`;

    data.forEach(team => {
        selHome.innerHTML += `<option value="${team}">${team}</option>`;
        selAway.innerHTML += `<option value="${team}">${team}</option>`;
    });
}

// ============================
// ANÁLISE DE CONFRONTO
// ============================
async function analisarConfronto() {
    const liga = document.getElementById("selectLiga").value;
    const home = document.getElementById("selectMandante").value;
    const away = document.getElementById("selectVisitante").value;

    if (!liga || !home || !away) return showAlert("Selecione todos os campos.");

    const res = await fetch(`${API_BASE}/h2h?league_id=${liga}&home=${home}&away=${away}`);
    const data = await res.json();

    document.getElementById("resultadoTexto").textContent = JSON.stringify(data, null, 2);
    document.getElementById("resultadoCard").style.display = "block";
}

// ============================
// MODALS (COMPATÍVEL COM SEU CSS ORIGINAL)
// ============================
function showModal(idModal, idBg) {
    document.getElementById(idModal).classList.add("show");
    document.getElementById(idBg).classList.add("show");
}

function hideModal(idModal, idBg) {
    document.getElementById(idModal).classList.remove("show");
    document.getElementById(idBg).classList.remove("show");
}

// Criar Liga
document.getElementById("btnAbrirCriarLiga").onclick = () =>
    showModal("modalCriarLiga", "modalCriarLigaBg");

document.getElementById("closeCriarLiga").onclick =
    document.getElementById("cancelarCriarLiga").onclick = () =>
        hideModal("modalCriarLiga", "modalCriarLigaBg");

// Salvar Liga
async function salvarLiga() {
    const nome = document.getElementById("inputNomeLiga").value;
    const season = document.getElementById("inputSeasonId").value;

    const league_id = nome.toLowerCase().replace(/\s+/g, "-");

    const res = await fetch(`${API_BASE}/leagues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ league_id, name: nome, season_id: season })
    });

    const data = await res.json();
    showAlert(data.message || "Liga criada!");

    hideModal("modalCriarLiga", "modalCriarLigaBg");
    carregarLigas();
}

document.getElementById("btnSalvarLiga").onclick = salvarLiga;

// Importar CSV
document.getElementById("btnAbrirImportarCSV").onclick = () =>
    showModal("modalImportarCSV", "modalImportarBg");

document.getElementById("closeImportarCSV").onclick =
    document.getElementById("cancelarImportarCSV").onclick = () =>
        hideModal("modalImportarCSV", "modalImportarBg");

async function importarCSV() {
    const liga = document.getElementById("selectLigaImport").value;
    const file = document.getElementById("inputArquivoCSV").files[0];

    if (!liga || !file) return showAlert("Selecione liga e arquivo.");

    const form = new FormData();
    form.append("league_id", liga);
    form.append("file", file);

    const res = await fetch(`${API_BASE}/leagues/${liga}/upload-team`, {
        method: "POST",
        body: form,
    });

    const data = await res.json();
    showAlert(data.message || "CSV importado");

    hideModal("modalImportarCSV", "modalImportarBg");
}

document.getElementById("btnImportarArquivo").onclick = importarCSV;

// ============================
// INIT
// ============================
document.getElementById("selectLiga").onchange = e => carregarTimes(e.target.value);

carregarLigas();

// URL do backend FastAPI (confere se é esse mesmo)
const API_BASE = "https://h2h-fastapi-backend.onrender.com/api";

// ---------- UTIL ----------

function showAlert(msg) {
    alert(msg);
}

function toggleAccordion(event) {
    const header = event.currentTarget;
    const body = header.nextElementSibling;
    body.style.display = body.style.display === "none" || body.style.display === "" ? "block" : "none";
}

// ---------- CARREGAR LIGAS ----------

async function carregarLigas() {
    try {
        const res = await fetch(`${API_BASE}/leagues`);
        const data = await res.json();

        const selectLiga = document.getElementById("selectLiga");
        const selectLigaImport = document.getElementById("selectLigaImport");

        selectLiga.innerHTML = `<option value="">Selecione...</option>`;
        selectLigaImport.innerHTML = `<option value="">Selecione...</option>`;

        data.forEach(lg => {
            const opt1 = document.createElement("option");
            opt1.value = lg.league_id;
            opt1.textContent = lg.name;
            selectLiga.appendChild(opt1);

            const opt2 = document.createElement("option");
            opt2.value = lg.league_id;
            opt2.textContent = lg.name;
            selectLigaImport.appendChild(opt2);
        });
    } catch (err) {
        console.error(err);
        showAlert("Erro ao carregar ligas.");
    }
}

// ---------- CARREGAR TIMES DA LIGA ----------

async function carregarTimes(leagueId) {
    if (!leagueId) return;

    try {
        const res = await fetch(`${API_BASE}/leagues/${leagueId}/teams`);
        const data = await res.json();

        const selHome = document.getElementById("selectMandante");
        const selAway = document.getElementById("selectVisitante");

        selHome.innerHTML = `<option value="">Selecione...</option>`;
        selAway.innerHTML = `<option value="">Selecione...</option>`;

        data.forEach(team => {
            const optH = document.createElement("option");
            optH.value = team.slug || team.name || team;
            optH.textContent = team.display_name || team.name || team;
            selHome.appendChild(optH);

            const optA = document.createElement("option");
            optA.value = team.slug || team.name || team;
            optA.textContent = team.display_name || team.name || team;
            selAway.appendChild(optA);
        });
    } catch (err) {
        console.error(err);
        showAlert("Erro ao carregar times da liga.");
    }
}

// ---------- ANÁLISE DE CONFRONTO ----------

async function analisarConfronto() {
    const leagueId = document.getElementById("selectLiga").value;
    const home = document.getElementById("selectMandante").value;
    const away = document.getElementById("selectVisitante").value;

    if (!leagueId || !home || !away) {
        showAlert("Selecione liga, mandante e visitante.");
        return;
    }

    try {
        const url = `${API_BASE}/h2h?league_id=${encodeURIComponent(leagueId)}&home=${encodeURIComponent(home)}&away=${encodeURIComponent(away)}`;
        const res = await fetch(url);
        const data = await res.json();

        const card = document.getElementById("resultadoCard");
        const pre = document.getElementById("resultadoTexto");

        pre.textContent = JSON.stringify(data, null, 2);
        card.style.display = "block";
    } catch (err) {
        console.error(err);
        showAlert("Erro ao analisar confronto.");
    }
}

// ---------- CRIAR LIGA ----------

function abrirModalCriarLiga() {
    document.getElementById("modalCriarLiga").style.display = "block";
}

function fecharModalCriarLiga() {
    document.getElementById("modalCriarLiga").style.display = "none";
}

async function salvarLiga() {
    const nome = document.getElementById("inputNomeLiga").value.trim();
    const season = document.getElementById("inputSeasonId").value.trim();

    if (!nome || !season) {
        showAlert("Preencha nome da liga e season ID.");
        return;
    }

    const league_id = nome.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

    try {
        const res = await fetch(`${API_BASE}/leagues`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                league_id,
                name: nome,
                season_id: season
            })
        });

        const data = await res.json();
        showAlert(data.message || "Liga criada.");
        fecharModalCriarLiga();
        carregarLigas();
    } catch (err) {
        console.error(err);
        showAlert("Erro ao criar liga.");
    }
}

// ---------- IMPORTAR CSV ----------

function abrirModalImportarCSV() {
    document.getElementById("modalImportarCSV").style.display = "block";
}

function fecharModalImportarCSV() {
    document.getElementById("modalImportarCSV").style.display = "none";
}

async function importarCSV() {
    const leagueId = document.getElementById("selectLigaImport").value;
    const fileInput = document.getElementById("inputArquivoCSV");
    const file = fileInput.files[0];

    if (!leagueId || !file) {
        showAlert("Escolha a liga e o arquivo CSV.");
        return;
    }

    const formData = new FormData();
    formData.append("league_id", leagueId);
    formData.append("file", file);

    try {
        const res = await fetch(`${API_BASE}/leagues/${leagueId}/upload-team`, {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        showAlert(data.message || "CSV importado.");
        fecharModalImportarCSV();
        fileInput.value = "";
    } catch (err) {
        console.error(err);
        showAlert("Erro ao importar CSV.");
    }
}

// ---------- INIT / EVENTOS ----------

document.addEventListener("DOMContentLoaded", () => {
    // accordion
    document.querySelectorAll(".accordion-header").forEach(btn => {
        btn.addEventListener("click", toggleAccordion);
    });

    // selects
    document.getElementById("selectLiga").addEventListener("change", (e) => {
        carregarTimes(e.target.value);
    });

    // botões principais
    document.getElementById("btnAnalisar").addEventListener("click", analisarConfronto);

    // criar liga
    document.getElementById("btnAbrirCriarLiga").addEventListener("click", abrirModalCriarLiga);
    document.getElementById("btnFecharCriarLiga").addEventListener("click", fecharModalCriarLiga);
    document.getElementById("btnSalvarLiga").addEventListener("click", salvarLiga);

    // importar csv
    document.getElementById("btnAbrirImportarCSV").addEventListener("click", abrirModalImportarCSV);
    document.getElementById("btnFecharImportarCSV").addEventListener("click", fecharModalImportarCSV);
    document.getElementById("btnImportarArquivo").addEventListener("click", importarCSV);

    // carrega ligas no início
    carregarLigas();
});

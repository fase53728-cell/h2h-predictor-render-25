// ===========================
//  COLAPSÁVEIS
// ===========================
document.querySelectorAll('.collapsible').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('show');
    });
});

// ===========================
//  MODAL
// ===========================
const modalBg = document.getElementById("modal-bg");
const modal = document.getElementById("modal");

function openModal() {
    modalBg.classList.add("show");
    modal.classList.add("show");
}

function closeModal() {
    modalBg.classList.remove("show");
    modal.classList.remove("show");
}
modalBg?.addEventListener("click", closeModal);

// ===========================
//  TABS DO MODAL
// ===========================
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".modal-content").forEach(c => c.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(tab.getAttribute("data-target")).classList.add("active");
    });
});

// ===========================
//  API BASE (FASTAPI BACKEND)
// ===========================
const API_BASE = "https://h2h-backend-fastapi-v2.onrender.com";

// ===========================
//  CARREGAR LIGAS
// ===========================
async function loadLeagues() {
    try {
        const res = await fetch(`${API_BASE}/leagues`);
        const leagues = await res.json();

        const mainSelect = document.getElementById("select-league");
        const modalSelect = document.getElementById("csv-league-select");

        mainSelect.innerHTML = `<option value="">Selecione...</option>`;
        modalSelect.innerHTML = `<option value="">Selecione...</option>`;

        leagues.forEach(league => {
            mainSelect.innerHTML += `<option value="${league.league_id}">${league.name}</option>`;
            modalSelect.innerHTML += `<option value="${league.league_id}">${league.name}</option>`;
        });

    } catch (err) {
        console.error("Erro ao carregar ligas:", err);
    }
}
loadLeagues();

// ===========================
//  CARREGAR TIMES DA LIGA
// ===========================
async function loadTeamsByLeague(league_id) {
    if (!league_id) return;

    try {
        const res = await fetch(`${API_BASE}/teams/${league_id}`);
        const teams = await res.json();

        const home = document.getElementById("select-home");
        const away = document.getElementById("select-away");

        home.innerHTML = `<option value="">Selecione...</option>`;
        away.innerHTML = `<option value="">Selecione...</option>`;

        teams.forEach(team => {
            home.innerHTML += `<option value="${team}">${team}</option>`;
            away.innerHTML += `<option value="${team}">${team}</option>`;
        });

    } catch (err) {
        console.error("Erro ao carregar times:", err);
    }
}

document.getElementById("select-league")
?.addEventListener("change", (e) => loadTeamsByLeague(e.target.value));

// ===========================
//  CRIAR LIGA
// ===========================
document.getElementById("btn-create-league")
?.addEventListener("click", async () => {

    const name = document.getElementById("nomeLiga").value.trim();
    const pais = document.getElementById("paisLiga").value.trim();
    const league_id = document.getElementById("idLiga").value.trim();
    const season_id = document.getElementById("idSeason").value.trim();

    if (!name || !league_id || !season_id) {
        alert("Preencha nome da liga, id da liga e id da temporada.");
        return;
    }

    const payload = { name, league_id, season_id, country: pais };

    try {
        const res = await fetch(`${API_BASE}/leagues`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Liga criada com sucesso!");
            closeModal();
            loadLeagues();
        } else {
            alert("Erro ao criar liga.");
        }

    } catch (err) {
        console.error(err);
    }
});

// ===========================
//  IMPORTAR CSV DOS TIMES
// ===========================
document.getElementById("btn-upload-teams")
?.addEventListener("click", async () => {

    const league_id = document.getElementById("csv-league-select").value;
    const files = document.getElementById("input-csv-files").files;

    if (!league_id) {
        alert("Selecione uma liga.");
        return;
    }

    if (!files.length) {
        alert("Selecione arquivos CSV.");
        return;
    }

    const form = new FormData();
    form.append("league_id", league_id);

    for (let f of files) {
        form.append("files", f);
    }

    try {
        const res = await fetch(`${API_BASE}/upload_csv`, {
            method: "POST",
            body: form
        });

        const data = await res.json();

        if (data.status === "ok") {
            alert("Times importados com sucesso!");
            closeModal();
        } else {
            alert("Erro ao importar CSV.");
        }

    } catch (err) {
        console.error(err);
    }
});

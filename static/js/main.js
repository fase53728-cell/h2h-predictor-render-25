// ===========================
//  COLAPSÁVEIS
// ===========================
document.querySelectorAll('.collapsible').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('open');
        const body = card.querySelector('.collapse-content');
        if (body) body.classList.toggle('open');
    });
});

// ===========================
//  MODAL DE IMPORTAÇÃO
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
        const target = tab.getAttribute("data-target");
        document.getElementById(target).classList.add("active");
    });
});

// ===========================
//  API BASE
// ===========================
const API_BASE = "https://h2h-backend-fastapi-v2.onrender.com";

// ===========================
//  CARREGAR LIGAS AO INICIAR
// ===========================
async function loadLeagues() {
    try {
        const res = await fetch(`${API_BASE}/leagues`);
        const leagues = await res.json();

        const mainSelect = document.getElementById("select-league");
        const modalSelect = document.getElementById("csv-league-select");

        if (!mainSelect || !modalSelect) return;

        mainSelect.innerHTML = `<option value="">Selecione...</option>`;
        modalSelect.innerHTML = `<option value="">Selecione...</option>`;

        leagues.forEach(league => {
            mainSelect.innerHTML += `<option value="${league.league_id}">${league.name}</option>`;
            modalSelect.innerHTML += `<option value="${league.league_id}">${league.name}</option>`;
        });

    } catch (e) {
        console.error("Erro ao carregar ligas:", e);
    }
}

loadLeagues();

// ===========================
//  CARREGAR TIMES POR LIGA
// ===========================
async function loadTeamsByLeague(leagueId) {
    if (!leagueId) return;

    try {
        const res = await fetch(`${API_BASE}/teams/${leagueId}`);
        const teams = await res.json();

        const home = document.getElementById("select-home");
        const away = document.getElementById("select-away");

        home.innerHTML = `<option value="">Selecione...</option>`;
        away.innerHTML = `<option value="">Selecione...</option>`;

        teams.forEach(team => {
            home.innerHTML += `<option value="${team}">${team}</option>`;
            away.innerHTML += `<option value="${team}">${team}</option>`;
        });

    } catch (e) {
        console.error("Erro ao carregar times:", e);
    }
}

document.getElementById("select-league")
    ?.addEventListener("change", (e) => loadTeamsByLeague(e.target.value));

// ===========================
//  CRIAR LIGA
// ===========================
document.getElementById("btn-create-league")
    ?.addEventListener("click", async () => {

        const name = document.getElementById("new-league-name").value.trim();
        const idLiga = document.getElementById("idLiga").value.trim();
        const idSeason = document.getElementById("idSeason").value.trim();

        if (!name || !idLiga || !idSeason) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        const payload = {
            name,
            league_id: idLiga,
            season_id: idSeason
        };

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

        } catch (e) {
            console.error("Erro:", e);
        }
    });

// ===========================
//  IMPORTAR CSV DOS TIMES
// ===========================
document.getElementById("btn-upload-teams")
    ?.addEventListener("click", async () => {

        const league = document.getElementById("csv-league-select").value;
        const files = document.getElementById("input-csv-files").files;

        if (!league) {
            alert("Selecione uma liga primeiro!");
            return;
        }

        if (!files.length) {
            alert("Selecione pelo menos 1 arquivo CSV.");
            return;
        }

        const formData = new FormData();
        formData.append("league", league);

        for (let f of files) {
            formData.append("files", f, f.name);
        }

        try {
            const res = await fetch(`${API_BASE}/upload_csv`, {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                alert("Times importados com sucesso!");
                closeModal();
                loadTeamsByLeague(league);
            } else {
                alert("Erro ao importar CSV.");
            }

        } catch (e) {
            console.error("Erro:", e);
        }
    });

// ===========================
//  ANALISAR CONFRONTO
// ===========================
async function analyzeH2H() {
    const league = document.getElementById("select-league").value;
    const home = document.getElementById("select-home").value;
    const away = document.getElementById("select-away").value;

    if (!league || !home || !away) {
        alert("Selecione a liga e os dois times.");
        return;
    }

    alert(`Analisando: ${home} vs ${away} (Liga ${league})`);
}

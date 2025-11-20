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
        const target = tab.getAttribute("data-target");
        document.getElementById(target).classList.add("active");
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
        if (!res.ok) {
            console.error("Erro HTTP ao listar ligas:", res.status);
            return;
        }

        const leagues = await res.json();
        console.log("Ligas carregadas:", leagues);

        const mainSelect = document.getElementById("select-league");
        const modalSelect = document.getElementById("csv-league-select");

        if (!mainSelect || !modalSelect) {
            console.warn("Selects de liga não encontrados no HTML.");
            return;
        }

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
async function loadTeamsByLeague(leagueId) {
    if (!leagueId) return;
    try {
        const res = await fetch(`${API_BASE}/league/${leagueId}/teams`);
        if (!res.ok) {
            console.error("Erro HTTP ao listar times:", res.status);
            return;
        }

        const teams = await res.json();
        console.log("Times da liga:", leagueId, teams);

        const home = document.getElementById("select-home");
        const away = document.getElementById("select-away");

        if (!home || !away) {
            console.warn("Selects de times não encontrados.");
            return;
        }

        home.innerHTML = `<option value="">Selecione...</option>`;
        away.innerHTML = `<option value="">Selecione...</option>`;

        teams.forEach(team => {
            // team.name vem do backend
            home.innerHTML += `<option value="${team.name}">${team.name}</option>`;
            away.innerHTML += `<option value="${team.name}">${team.name}</option>`;
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

        const nome = document.getElementById("nomeLiga")?.value.trim();
        const pais = document.getElementById("paisLiga")?.value.trim();
        const idLiga = document.getElementById("idLiga")?.value.trim();
        const idSeason = document.getElementById("idSeason")?.value.trim();

        // Para o backend atual, só usamos "name".
        if (!nome) {
            alert("Preencha pelo menos o Nome da Liga.");
            return;
        }

        const payload = { name: nome };

        console.log("Enviando criação de liga:", payload);

        try {
            const res = await fetch(`${API_BASE}/league`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error("Erro HTTP ao criar liga:", res.status, errText);
                alert("Erro ao criar liga.");
                return;
            }

            const data = await res.json();
            console.log("Liga criada:", data);

            alert("Liga criada com sucesso!");
            closeModal();
            loadLeagues();

        } catch (err) {
            console.error("Erro JS ao criar liga:", err);
            alert("Erro ao criar liga (ver console).");
        }
    });

// ===========================
//  IMPORTAR CSV DOS TIMES
// ===========================
document.getElementById("btn-upload-teams")
    ?.addEventListener("click", async () => {

        const leagueId = document.getElementById("csv-league-select")?.value;
        const files = document.getElementById("input-csv-files")?.files;

        if (!leagueId) {
            alert("Selecione uma liga.");
            return;
        }

        if (!files || !files.length) {
            alert("Selecione arquivos CSV.");
            return;
        }

        try {
            console.log(`Enviando ${files.length} arquivos para a liga:`, leagueId);

            for (let f of files) {
                const form = new FormData();
                form.append("file", f);  // o backend espera campo "file"

                const res = await fetch(`${API_BASE}/league/${leagueId}/upload-team`, {
                    method: "POST",
                    body: form
                });

                if (!res.ok) {
                    const errText = await res.text();
                    console.error("Erro HTTP ao enviar arquivo:", f.name, res.status, errText);
                    alert(`Erro ao importar o arquivo: ${f.name}`);
                    return;
                }

                const data = await res.json();
                console.log("Time importado:", data);
            }

            alert("Times importados com sucesso!");
            closeModal();
            await loadTeamsByLeague(leagueId);

        } catch (err) {
            console.error("Erro JS ao importar CSVs:", err);
            alert("Erro ao importar times (ver console).");
        }
    });

// ===========================
//  ANALISAR CONFRONTO (placeholder)
// ===========================
async function analyzeH2H() {
    const leagueId = document.getElementById("select-league")?.value;
    const home = document.getElementById("select-home")?.value;
    const away = document.getElementById("select-away")?.value;

    if (!leagueId || !home || !away) {
        alert("Selecione a liga e os dois times.");
        return;
    }

    alert(`(placeholder) Analisando: ${home} vs ${away} na liga ${leagueId}`);
    // Depois ligamos aqui no endpoint:
    // GET /league/{league_id}/h2h?home=...&away=...
}

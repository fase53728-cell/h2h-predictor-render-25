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
//  API BASE (FRONTEND -> BACKEND FLASK)
// ===========================
const API_BASE = "https://h2h-backend-fastapi-v2.onrender.com/api";

// ===========================
//  CARREGAR LIGAS
// ===========================
async function loadLeagues() {
    try {
        const res = await fetch(`${API_BASE}/get_leagues`);
        const leagues = await res.json();

        const mainSelect = document.getElementById("select-league");
        const modalSelect = document.getElementById("csv-league-select");

        mainSelect.innerHTML = `<option value="">Selecione...</option>`;
        modalSelect.innerHTML = `<option value="">Selecione...</option>`;

        leagues.forEach(liga => {
            mainSelect.innerHTML += `<option value="${liga.slug}">${liga.nome}</option>`;
            modalSelect.innerHTML += `<option value="${liga.slug}">${liga.nome}</option>`;
        });

    } catch (err) {
        console.error("Erro ao carregar ligas:", err);
    }
}
loadLeagues();

// ===========================
//  CARREGAR TIMES DE UMA LIGA
// ===========================
async function loadTeamsByLeague(slug) {
    if (!slug) return;

    const res = await fetch(`${API_BASE}/get_teams/${slug}`);
    const teams = await res.json();

    const home = document.getElementById("select-home");
    const away = document.getElementById("select-away");

    home.innerHTML = `<option value="">Selecione...</option>`;
    away.innerHTML = `<option value="">Selecione...</option>`;

    teams.forEach(team => {
        home.innerHTML += `<option value="${team}">${team}</option>`;
        away.innerHTML += `<option value="${team}">${team}</option>`;
    });
}

document.getElementById("select-league")
?.addEventListener("change", e => loadTeamsByLeague(e.target.value));

// ===========================
//  CRIAR LIGA
// ===========================
document.getElementById("btn-create-league")
?.addEventListener("click", async () => {

    const nome = document.getElementById("nomeLiga").value.trim();
    const pais = document.getElementById("paisLiga").value.trim();
    const id_liga = document.getElementById("idLiga").value.trim();
    const id_temporada = document.getElementById("idSeason").value.trim();

    if (!nome || !id_liga || !id_temporada) {
        alert("Preencha nome da liga, id da liga e id da temporada.");
        return;
    }

    const payload = { nome, pais, id_liga, id_temporada };

    try {
        const res = await fetch(`${API_BASE}/create_league`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.status === "ok") {
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
//  IMPORTAR CSV
// ===========================
document.getElementById("btn-upload-teams")
?.addEventListener("click", async () => {

    const slug = document.getElementById("csv-league-select").value;
    const files = document.getElementById("input-csv-files").files;

    if (!slug) {
        alert("Selecione uma liga.");
        return;
    }

    if (!files.length) {
        alert("Selecione arquivos CSV.");
        return;
    }

    const form = new FormData();
    for (let f of files) form.append("files", f);

    try {
        const res = await fetch(`${API_BASE}/import_csv/${slug}`, {
            method: "POST",
            body: form
        });

        const data = await res.json();

        if (data.status === "ok") {
            alert("Times importados com sucesso!");
            closeModal();
        }

    } catch (err) {
        console.error(err);
    }
});

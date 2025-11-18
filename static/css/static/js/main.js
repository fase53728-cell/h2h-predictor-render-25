// ===========================
//  COLAPSÁVEIS
// ===========================
document.querySelectorAll('.collapsible').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('show');
    });
});

// ===========================
//  MODAL DE IMPORTAÇÃO
// ===========================
const modalBg = document.getElementById("modal-bg");
const modal = document.getElementById("modal");

function openModal() {
    modalBg.style.display = "block";
    modal.style.display = "block";
}

function closeModal() {
    modalBg.style.display = "none";
    modal.style.display = "none";
}

// Fecha clicando no fundo
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
//  BUSCAR TIMES DA LIGA
// ===========================
async function loadTeamsByLeague(leagueName) {
    if (!leagueName) return;

    const response = await fetch(`/api/teams/${leagueName}`);
    const teams = await response.json();

    const mandante = document.getElementById("timeMandante");
    const visitante = document.getElementById("timeVisitante");

    mandante.innerHTML = "";
    visitante.innerHTML = "";

    teams.forEach(team => {
        mandante.innerHTML += `<option value="${team}">${team}</option>`;
        visitante.innerHTML += `<option value="${team}">${team}</option>`;
    });
}

// ===========================
//  EVENTO CHANGE DO SELECT DE LIGA
// ===========================
const selectLiga = document.getElementById("ligaSelect");
if (selectLiga) {
    selectLiga.addEventListener("change", (e) => {
        loadTeamsByLeague(e.target.value);
    });
}

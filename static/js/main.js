console.log("main.js carregado com sucesso");

// ================= COLAPSÁVEIS =================

function toggleSection(id) {
  const content = document.getElementById(id);
  if (!content) return;

  const card = content.closest(".collapsible");
  const arrow = card.querySelector(".arrow");

  const isOpen = content.classList.contains("open");
  if (isOpen) {
    content.classList.remove("open");
    card.classList.remove("open");
  } else {
    content.classList.add("open");
    card.classList.add("open");
  }
}

// ================= MODAL =================

function openModal() {
  document.getElementById("modal-bg").classList.add("active");
}

function closeModal() {
  document.getElementById("modal-bg").classList.remove("active");
}

// Expor no escopo global para o HTML
window.toggleSection = toggleSection;
window.openModal = openModal;
window.closeModal = closeModal;

// ================= TABS DO MODAL =================

document.addEventListener("click", (event) => {
  const tab = event.target.closest(".tab");
  if (!tab) return;

  const targetId = tab.getAttribute("data-target");

  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");

  document.querySelectorAll(".modal-content").forEach((content) => {
    content.classList.remove("active");
  });

  const targetContent = document.getElementById(targetId);
  if (targetContent) targetContent.classList.add("active");
});

// ================= CHAMADAS DE API =================

// Carregar ligas no select principal e no modal
async function loadLeagues() {
  try {
    const response = await fetch("/api/get_leagues");
    const ligas = await response.json();

    const selectLiga = document.getElementById("liga");
    const selectLigaImport = document.getElementById("ligaImport");

    if (selectLiga) {
      selectLiga.innerHTML = '<option value="">Selecione uma liga</option>';
    }
    if (selectLigaImport) {
      selectLigaImport.innerHTML = '<option value="">Selecione a liga</option>';
    }

    ligas.forEach((liga) => {
      const opt1 = document.createElement("option");
      opt1.value = liga.slug;
      opt1.textContent = liga.nome;
      if (selectLiga) selectLiga.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = liga.slug;
      opt2.textContent = liga.nome;
      if (selectLigaImport) selectLigaImport.appendChild(opt2);
    });
  } catch (err) {
    console.error("Erro ao carregar ligas:", err);
  }
}

// Quando selecionar liga, podemos futuramente carregar times específicos
// Por enquanto só loga
const ligaSelect = document.getElementById("liga");
if (ligaSelect) {
  ligaSelect.addEventListener("change", () => {
    console.log("Liga selecionada:", ligaSelect.value);
  });
}

// Criar liga
async function createLeague() {
  const nome = document.getElementById("nomeLiga").value.trim();
  const pais = document.getElementById("paisLiga").value.trim();
  const idLiga = document.getElementById("idLiga").value.trim();
  const idTemporada = document.getElementById("idTemporada").value.trim();

  if (!nome) {
    alert("Informe o nome da liga.");
    return;
  }

  try {
    const resp = await fetch("/api/create_league", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        pais,
        id_liga: idLiga,
        id_temporada: idTemporada,
      }),
    });

    const data = await resp.json();
    console.log("Liga criada:", data);
    alert("Liga criada com sucesso!");

    // Recarregar lista
    await loadLeagues();
  } catch (err) {
    console.error("Erro ao criar liga:", err);
    alert("Erro ao criar liga.");
  }
}

// Importar CSV de times
async function importTeams() {
  const ligaSlug = document.getElementById("ligaImport").value;
  const arquivoInput = document.getElementById("arquivoCSV");

  if (!ligaSlug) {
    alert("Selecione uma liga para importar os times.");
    return;
  }

  if (!arquivoInput.files.length) {
    alert("Selecione pelo menos um arquivo CSV.");
    return;
  }

  const formData = new FormData();
  for (const file of arquivoInput.files) {
    formData.append("files", file);
  }

  try {
    const resp = await fetch(`/api/import_csv/${ligaSlug}`, {
      method: "POST",
      body: formData,
    });

    const data = await resp.json();
    console.log("Times importados:", data);
    alert("Times importados com sucesso!");
  } catch (err) {
    console.error("Erro ao importar times:", err);
    alert("Erro ao importar times.");
  }
}

// Expor no escopo global
window.createLeague = createLeague;
window.importTeams = importTeams;

// Carregar ligas ao iniciar
document.addEventListener("DOMContentLoaded", loadLeagues);

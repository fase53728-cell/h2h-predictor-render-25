/* ================================
      CONTROLES DE COLAPSE
================================ */
function toggleSection(id) {
  const body = document.getElementById(id);
  const arrow = body.parentElement.querySelector(".arrow");

  body.classList.toggle("show");
  arrow.classList.toggle("open");
}

/* ================================
      MODAL – ABRIR / FECHAR
================================ */
function openModal() {
  document.getElementById("modal-bg").classList.add("show");
  document.getElementById("modal").classList.add("show");
}

function closeModal() {
  document.getElementById("modal-bg").classList.remove("show");
  document.getElementById("modal").classList.remove("show");
}

/* Impede clique dentro do modal de fechar o fundo */
document.getElementById("modal").addEventListener("click", (e) => {
  e.stopPropagation();
});

/* ================================
      TABS DO MODAL
================================ */
const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".modal-content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    
    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));

    tab.classList.add("active");

    const target = tab.getAttribute("data-target");
    document.getElementById(target).classList.add("active");
  });
});

/* ================================
      PLACEHOLDERS (para evitar erros)
================================ */
function createLeague() {
  alert("⚠ Função createLeague() ainda não conectada ao backend.");
}

function importTeams() {
  alert("⚠ Função importTeams() ainda não conectada ao backend.");
}

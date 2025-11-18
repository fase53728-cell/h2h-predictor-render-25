console.log("main.js carregado com sucesso");

// =============================================
// CONTROLAR COLAPSÁVEIS (Palpites, Múltiplas etc.)
// =============================================
function toggleSection(id) {
    const section = document.getElementById(id);
    if (!section) return;

    section.classList.toggle("collapse-content");

    const arrow = section.parentElement.querySelector(".arrow");
    if (arrow) {
        arrow.classList.toggle("open");
    }
}

// =============================================
// MODAL NOVA LIGA / IMPORTAR CSV
// =============================================
function openModal() {
    document.getElementById("modal-bg").classList.add("active");
    document.getElementById("modal").classList.add("active");
}

function closeModal() {
    document.getElementById("modal-bg").classList.remove("active");
    document.getElementById("modal").classList.remove("active");
}

// Alternar abas do modal
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-target");

        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        document.querySelectorAll(".modal-content").forEach(box => {
            box.classList.remove("active");
        });

        document.getElementById(target).classList.add("active");
    });
});

// =============================================
// CRIAR LIGA (Somente Front — backend faz depois)
// =============================================
document.getElementById("btnCriarLiga")?.addEventListener("click", () => {
    const nomeLiga = document.getElementById("nomeLiga").value.trim();
    const idLiga = document.getElementById("idLiga").value.trim();
    const seasonLiga = document.getElementById("seasonLiga").value.trim();

    if (!nomeLiga || !idLiga || !seasonLiga) {
        alert("Preencha todos os campos da nova liga.");
        return;
    }

    alert(`Liga criada: ${nomeLiga} (ID: ${idLiga} / Season: ${seasonLiga})`);
    closeModal();
});

// =============================================
// IMPORTAR CSV
// =============================================
document.getElementById("inputCSV")?.addEventListener("change", async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        const csv = e.target.result;
        console.log("CSV carregado:", csv.substring(0, 200));

        alert("CSV importado com sucesso! (Integração backend vem depois)");
    };

    reader.readAsText(file);
});

// =============================================
// CARREGAR TIMES AUTOMATICAMENTE QUANDO LIGA É SELECIONADA
// =============================================
async function carregarTimesDaLiga() {
    console.log("Carregar times… (Backend será integrado depois)");
}

document.getElementById("selectLiga")?.addEventListener("change", carregarTimesDaLiga);

// =============================================
// INICIALIZAÇÃO
// =============================================
console.log("Sistema front-end carregado.");

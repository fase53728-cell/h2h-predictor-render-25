from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)

# Garantir diretórios base
os.makedirs("data/ligas", exist_ok=True)
os.makedirs("data/times", exist_ok=True)


# -----------------------------
# ROTAS DO PAINEL
# -----------------------------

@app.route("/")
def index():
    return render_template("index.html")


# -----------------------------
# CRIAR LIGA
# -----------------------------
@app.route("/api/create_league", methods=["POST"])
def create_league():
    data = request.json

    nome = data.get("nome")
    pais = data.get("pais")
    id_liga = data.get("id_liga")
    id_temporada = data.get("id_temporada")

    # SLUG AUTOMÁTICO
    slug = (
        nome.lower()
        .replace("(", "")
        .replace(")", "")
        .replace("'", "")
        .replace("/", "")
        .replace("-", " ")
        .replace("  ", " ")
        .replace(" ", "_")
    )

    league_info = {
        "nome": nome,
        "slug": slug,
        "pais": pais,
        "id_liga": id_liga,
        "id_temporada": id_temporada
    }

    # Salvar JSON da liga
    with open(f"data/ligas/{slug}.json", "w", encoding="utf-8") as f:
        json.dump(league_info, f, indent=4, ensure_ascii=False)

    # Criar pasta da liga
    os.makedirs(f"data/times/{slug}", exist_ok=True)

    return jsonify({"status": "ok", "slug": slug})


# -----------------------------
# LISTAR LIGAS
# -----------------------------
@app.route("/api/get_leagues")
def get_leagues():
    ligas = []

    for file in os.listdir("data/ligas"):
        if file.endswith(".json"):
            with open(f"data/ligas/{file}", "r", encoding="utf-8") as f:
                ligas.append(json.load(f))

    return jsonify(ligas)


# -----------------------------
# IMPORTAR CSVs DE UMA LIGA
# -----------------------------
@app.route("/api/import_csv/<slug>", methods=["POST"])
def import_csv(slug):
    files = request.files.getlist("files")

    save_path = f"data/times/{slug}"
    os.makedirs(save_path, exist_ok=True)

    saved = []

    for file in files:
        filename = (
            file.filename.lower()
            .replace(" ", "_")
            .replace("-", "_")
            .replace("(", "")
            .replace(")", "")
        )
        file.save(os.path.join(save_path, filename))
        saved.append(filename)

    return jsonify({"status": "ok", "saved": saved})


# -----------------------------
# LISTAR TIMES DA LIGA
# -----------------------------
@app.route("/api/get_teams/<slug>")
def get_teams(slug):
    path = f"data/times/{slug}"

    if not os.path.exists(path):
        return jsonify([])

    teams = [
        f.replace(".csv", "").replace("_", " ").title()
        for f in os.listdir(path)
        if f.endswith(".csv")
    ]

    return jsonify(teams)


# -----------------------------
# ANÁLISE (placeholder)
# -----------------------------
@app.route("/api/analyze", methods=["POST"])
def analyze():
    return jsonify({
        "status": "ok",
        "mensagem": "Motor H2H será conectado aqui."
    })


# -----------------------------
# RUN (LOCAL)
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)

from flask import Flask, jsonify, request
from flask_cors import CORS
from stats_engine import StatsEngine
from repositories import TeamRepository

app = Flask(__name__)
CORS(app)

stats_engine = StatsEngine()
team_repo = TeamRepository()


@app.route("/")
def home():
    return jsonify({"status": "online", "message": "H2H Predictor Render API funcionando"})


@app.route("/teams", methods=["GET"])
def get_teams():
    """Retorna a lista de times disponíveis."""
    teams = team_repo.get_all_teams()
    return jsonify({"teams": teams})


@app.route("/predict", methods=["POST"])
def predict():
    """
    Recebe: { "home": "Time A", "away": "Time B" }
    Retorna: previsões completas baseadas nos CSVs.
    """
    data = request.get_json()
    home = data.get("home")
    away = data.get("away")

    if not home or not away:
        return jsonify({"error": "Parâmetros inválidos"}), 400

    result = stats_engine.generate_prediction(home, away)
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)

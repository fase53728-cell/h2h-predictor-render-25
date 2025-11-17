from flask import Blueprint, jsonify, request
import os
import csv

from .analytics_engine import AnalyticsEngine
from .config import config

api = Blueprint("api", __name__)

engine = AnalyticsEngine()

# Diretório base dos CSVs de ligas
CSV_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "csv")


def load_league_csv(league_code):
    """
    Carrega o CSV de uma liga (ex: 'epl', 'la_liga') em forma de lista de dicts.
    """
    path = os.path.join(CSV_DIR, f"{league_code}.csv")
    if not os.path.exists(path):
        return [], path

    rows = []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            rows.append(row)
    return rows, path


@api.route("/ping")
def ping():
    return jsonify({"status": "ok"})


# =========================
#   LISTA DE LIGAS
# =========================

@api.route("/leagues", methods=["GET"])
def get_leagues():
    """
    Lista as ligas disponíveis baseado nos CSVs existentes em /data/csv.
    """
    if not os.path.exists(CSV_DIR):
        return jsonify([])

    leagues = []
    for filename in os.listdir(CSV_DIR):
        if filename.endswith(".csv"):
            code = filename.replace(".csv", "")
            leagues.append({
                "code": code,
                "name": code.replace("_", " ").title()
            })

    return jsonify(leagues)


# =========================
#   TIMES DE UMA LIGA
# =========================

@api.route("/teams", methods=["GET"])
def get_teams():
    """
    Retorna a lista de times de uma liga.
    Exemplo: /api/teams?league=epl
    """
    league = request.args.get("league")
    if not league:
        return jsonify({"error": "league param required"}), 400

    rows, _ = load_league_csv(league)
    teams = []

    for row in rows:
        teams.append({
            "name": row.get("team") or row.get("name"),
            "position": row.get("position"),
            "rpg": row.get("rpg"),
            "recent_form": row.get("recent_form") or row.get("form"),
            "home_over_15_ft": row.get("home_over_15_ft"),
            "home_over_25_ft": row.get("home_over_25_ft"),
            "home_btts": row.get("home_btts"),
            "home_corners_avg_ft": row.get("home_corners_avg_ft"),
            "home_score_ht_freq": row.get("home_score_ht_freq"),
            "logo": row.get("logo"),
            "_raw": row  # mantemos o resto aqui se precisar
        })

    return jsonify(teams)


# =========================
#   ANÁLISE H2H
# =========================

@api.route("/h2h", methods=["GET"])
def h2h_analysis():
    """
    Análise completa de confronto.
    Exemplo: /api/h2h?league=epl&home=Arsenal&away=Chelsea
    """
    league = request.args.get("league")
    home_name = request.args.get("home")
    away_name = request.args.get("away")

    if not league or not home_name or not away_name:
        return jsonify({"error": "league, home and away params are required"}), 400

    rows, _ = load_league_csv(league)
    if not rows:
        return jsonify({"error": "league csv not found"}), 404

    home_row = None
    away_row = None

    for row in rows:
        name = (row.get("team") or row.get("name") or "").strip().lower()
        if name == home_name.strip().lower():
            home_row = row
        if name == away_name.strip().lower():
            away_row = row

    if not home_row or not away_row:
        return jsonify({"error": "home or away team not found in csv"}), 404

    # Monta estruturas para o motor de análise
    home = {
        "name": home_name,
        "position": home_row.get("position"),
        "rpg": home_row.get("rpg"),
        "gf_avg": home_row.get("goals_for_avg") or home_row.get("gf_avg"),
        "ga_avg": home_row.get("goals_against_avg") or home_row.get("ga_avg"),
        "recent_form": home_row.get("recent_form") or home_row.get("form"),
        "home_over_15_ft": home_row.get("home_over_15_ft"),
        "home_over_25_ft": home_row.get("home_over_25_ft"),
        "home_btts": home_row.get("home_btts"),
        "home_corners_avg_ft": home_row.get("home_corners_avg_ft"),
        "home_score_ht_freq": home_row.get("home_score_ht_freq"),
    }

    away = {
        "name": away_name,
        "position": away_row.get("position"),
        "rpg": away_row.get("rpg"),
        "gf_avg": away_row.get("goals_for_avg") or away_row.get("gf_avg"),
        "ga_avg": away_row.get("goals_against_avg") or away_row.get("ga_avg"),
        "recent_form": away_row.get("recent_form") or away_row.get("form"),
        "away_over_15_ft": away_row.get("away_over_15_ft"),
        "away_over_25_ft": away_row.get("away_over_25_ft"),
        "away_btts": away_row.get("away_btts"),
        "away_corners_avg_ft": away_row.get("away_corners_avg_ft"),
        "away_score_ht_freq": away_row.get("away_score_ht_freq"),
    }

    winprob = engine.calculate_win_probabilities(home, away)
    trends = engine.goal_trends(home, away)
    triggers = engine.smart_triggers(home, away)
    tipster = engine.generate_tipster_prediction(home, away, winprob, trends)

    return jsonify({
        "home": home,
        "away": away,
        "win_probabilities": winprob,
        "goal_trends": trends,
        "triggers": triggers,
        "tipster": tipster
    })


# =========================
#   PALPITES DO DIA
# =========================

@api.route("/daily-tips", methods=["GET"])
def daily_tips():
    """
    Retorna palpites fortes de times (Top 5).
    Opcional: ?league=epl  (se não mandar, pega todas ligas)
    """
    league = request.args.get("league")

    tips = []

    leagues = []
    if league:
        leagues = [league]
    else:
        if os.path.exists(CSV_DIR):
            leagues = [
                f.replace(".csv", "")
                for f in os.listdir(CSV_DIR)
                if f.endswith(".csv")
            ]

    for lg in leagues:
        rows, _ = load_league_csv(lg)
        for row in rows:
            team = {
                "name": row.get("team") or row.get("name"),
                "rpg": row.get("rpg"),
                "position": row.get("position"),
                "home_over_15_ft": row.get("home_over_15_ft"),
                "home_over_25_ft": row.get("home_over_25_ft"),
                "home_btts": row.get("home_btts"),
                "home_corners_avg_ft": row.get("home_corners_avg_ft"),
                "home_score_ht_freq": row.get("home_score_ht_freq"),
            }
            eval_tips = engine.evaluate_daily_tip(team)
            if eval_tips:
                tips.append({
                    "league": lg,
                    "team": team["name"],
                    "rpg": team["rpg"],
                    "position": team["position"],
                    "tips": eval_tips
                })

    # Ordena por “peso” aproximado (rpg + número de sinais)
    tips_sorted = sorted(
        tips,
        key=lambda t: (float(t["rpg"] or 0), len(t["tips"])),
        reverse=True
    )

    return jsonify(tips_sorted[:10])


# =========================
#   APOSTAS MÚLTIPLAS
# =========================

@api.route("/multiple-bets", methods=["GET"])
def multiple_bets():
    """
    Retorna possíveis apostas múltiplas (Top 6).
    Opcional: ?league=epl
    """
    league = request.args.get("league")

    multiples = []

    leagues = []
    if league:
        leagues = [league]
    else:
        if os.path.exists(CSV_DIR):
            leagues = [
                f.replace(".csv", "")
                for f in os.listdir(CSV_DIR)
                if f.endswith(".csv")
            ]

    for lg in leagues:
        rows, _ = load_league_csv(lg)
        for row in rows:
            team = {
                "name": row.get("team") or row.get("name"),
                "rpg": row.get("rpg"),
                "position": row.get("position"),
                "home_over_25_ft": row.get("home_over_25_ft"),
                "home_btts": row.get("home_btts"),
                "home_corners_avg_ft": row.get("home_corners_avg_ft"),
            }
            eval_mult = engine.evaluate_multiple_bets(team)
            if eval_mult:
                multiples.append({
                    "league": lg,
                    "team": team["name"],
                    "rpg": team["rpg"],
                    "position": team["position"],
                    "combos": eval_mult
                })

    multiples_sorted = sorted(
        multiples,
        key=lambda m: (float(m["rpg"] or 0), len(m["combos"])),
        reverse=True
    )

    return jsonify(multiples_sorted[:6])

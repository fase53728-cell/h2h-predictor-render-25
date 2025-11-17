from .repositories import StatsRepository
from .models import TeamStats
import math


class StatsEngine:

    # ==========================
    #   NORMALIZAÇÃO DE NÚMEROS
    # ==========================

    @staticmethod
    def pct(value):
        """Converte string ou número em percentual seguro"""
        try:
            value = value.replace("%", "").strip()
            return float(value)
        except:
            return 0.0

    @staticmethod
    def num(value):
        try:
            return float(value)
        except:
            return 0.0

    # ==========================
    #   FORÇA (RPG)
    # ==========================

    @staticmethod
    def compute_rpg(team: TeamStats):
        """
        RPG = (PPG * 0.4) + (GF * 0.3) + (Shots_on/avg) * 0.3
        Simplificado para versão inicial
        """
        ppg = StatsEngine.num(team.ppg_total)
        gf = StatsEngine.num(team.goals_for_avg)
        shots = StatsEngine.num(team.shots_total)

        return round((ppg * 0.4) + (gf * 0.3) + (shots * 0.3), 2)

    # ==========================
    #    PROBABILIDADES
    # ==========================

    @staticmethod
    def win_probability(home_rpg, away_rpg):
        total = home_rpg + away_rpg
        if total == 0:
            return 50, 50
        home = (home_rpg / total) * 100
        away = (away_rpg / total) * 100
        return round(home, 1), round(away, 1)

    # ================================
    #      ANÁLISE COMPLETA H2H
    # ================================

    @staticmethod
    def analyze_match(home: TeamStats, away: TeamStats):
        """
        Retorna TODA a análise, pronta para o painel.
        """

        # --- RPG ---
        home_rpg = StatsEngine.compute_rpg(home)
        away_rpg = StatsEngine.compute_rpg(away)

        # --- Win Prob ---
        home_win, away_win = StatsEngine.win_probability(home_rpg, away_rpg)
        draw_prob = round((100 - (home_win + away_win)) * 0.65, 1)

        # --- Gatilho ≥70% HT gol ---
        ht_goal_trigger = StatsEngine.pct(home.ht_goal_pct) >= 70

        # --- Over/Under ---
        over15 = (StatsEngine.pct(home.over15) + StatsEngine.pct(away.over15)) / 2
        over25 = (StatsEngine.pct(home.over25) + StatsEngine.pct(away.over25)) / 2
        btts = (StatsEngine.pct(home.btts) + StatsEngine.pct(away.btts)) / 2

        # --- Escanteios ---
        corners_home_avg = StatsEngine.num(home.corners_for_avg)
        corners_away_avg = StatsEngine.num(away.corners_for_avg)
        corners_total = round(corners_home_avg + corners_away_avg, 1)

        # --- Chutes ---
        total_shots = StatsEngine.num(home.shots_total) + StatsEngine.num(away.shots_total)
        shots_on = StatsEngine.num(home.shots_on) + StatsEngine.num(away.shots_on)

        # --- SUGESTÃO DE APOSTA ---
        diff = abs(home_win - away_win)

        if diff >= 15:
            suggested = "1" if home_win > away_win else "2"
        elif diff >= 8:
            suggested = "X1" if home_win > away_win else "X2"
        else:
            suggested = "X"

        # --- Handicap asiático sugerido ---
        if diff >= 20:
            handicap = "-1.0" if home_win > away_win else "+1.0"
        elif diff >= 12:
            handicap = "-0.5" if home_win > away_win else "+0.5"
        else:
            handicap = "0.0"

        # Gatilho especial
        trigger_text = None
        if ht_goal_trigger:
            trigger_text = "⚠️ ALERTA: Mandante ≥70% gols HT — Alta chance Over 1.5 escanteios HT (mandante)"

        return {
            "rpg": {
                "home": home_rpg,
                "away": away_rpg
            },
            "probabilities": {
                "home_win": home_win,
                "away_win": away_win,
                "draw": draw_prob
            },
            "goals": {
                "over15": over15,
                "over25": over25,
                "btts": btts
            },
            "corners": {
                "home_avg": corners_home_avg,
                "away_avg": corners_away_avg,
                "total": corners_total
            },
            "shots": {
                "total": total_shots,
                "on_target": shots_on
            },
            "suggestion": {
                "bet": suggested,
                "handicap": handicap
            },
            "trigger": trigger_text
        }


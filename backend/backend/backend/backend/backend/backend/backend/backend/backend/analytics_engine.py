import math
import statistics

class AnalyticsEngine:

    def __init__(self):
        pass

    # ===============================================================
    # FUNÇÕES MATEMÁTICAS DE BASE
    # ===============================================================

    def safe(self, v, dv=0):
        try:
            return float(v)
        except:
            return dv

    def pct(self, value):
        try:
            return round(float(value), 2)
        except:
            return 0.0

    # ===============================================================
    # CÁLCULO DA FORÇA (IPG / RPG AVANÇADO)
    # ===============================================================

    def calculate_strength(self, team):
        rpg = self.safe(team.get("rpg"))
        gf = self.safe(team.get("gf_avg"))
        ga = self.safe(team.get("ga_avg"))

        form = {
            "WW": 8,
            "LW": 4,
            "WL": 4,
            "LL": 1
        }.get(team.get("recent_form", "").upper().replace(" ", ""), 5)

        position_bonus = max(0, 10 - self.safe(team.get("position", 10)))

        return rpg * 30 + gf * 15 - ga * 10 + form + position_bonus

    # ===============================================================
    # PROBABILIDADE DE VITÓRIA (TIPSTER)
    # ===============================================================

    def calculate_win_probabilities(self, home, away):
        H = self.calculate_strength(home)
        A = self.calculate_strength(away)

        total = max(H + A, 1)
        home_prob = (H / total) * 100
        away_prob = (A / total) * 100

        home_prob = min(85, max(15, home_prob))
        away_prob = min(85, max(15, away_prob))

        draw_prob = max(5, 100 - (home_prob + away_prob))

        return {
            "home": round(home_prob, 1),
            "draw": round(draw_prob, 1),
            "away": round(away_prob, 1)
        }

    # ===============================================================
    # TENDÊNCIAS DE GOLS
    # ===============================================================

    def goal_trends(self, home, away):

        over15 = statistics.mean([
            self.safe(home.get("home_over_15_ft")),
            self.safe(away.get("away_over_15_ft"))
        ])

        over25 = statistics.mean([
            self.safe(home.get("home_over_25_ft")),
            self.safe(away.get("away_over_25_ft"))
        ])

        btts = statistics.mean([
            self.safe(home.get("home_btts")),
            self.safe(away.get("away_btts"))
        ])

        return {
            "over15": round(over15),
            "over25": round(over25),
            "btts": round(btts)
        }

    # ===============================================================
    # GATILHOS INTELIGENTES
    # ===============================================================

    def smart_triggers(self, home, away):

        triggers = []

        # Gatilho do HT
        if self.safe(home.get("home_score_ht_freq")) >= 70:
            triggers.append("⚡ Mandante marca HT frequentemente")
            triggers.append("🚨 Alta chance Over 1.5 cantos HT mandante")

        # Over FT forte
        if self.safe(home.get("home_over_25_ft")) >= 70 and self.safe(away.get("away_over_25_ft")) >= 70:
            triggers.append("🔥 Jogo muito forte para Over 2.5 FT")

        # BTTS forte
        if self.safe(home.get("home_btts")) >= 55 and self.safe(away.get("away_btts")) >= 55:
            triggers.append("⚽ Ambos marcam provável")

        # Escanteios
        combined_corners = self.safe(home.get("home_corners_avg_ft")) + self.safe(away.get("away_corners_avg_ft"))
        if combined_corners >= 10:
            triggers.append(f"🚩 Forte tendência Over 9.5 cantos ({combined_corners:.1f} média)")

        return triggers

    # ===============================================================
    # PALPITE DO DIA
    # ===============================================================

    def evaluate_daily_tip(self, team):

        tips = []

        if self.safe(team.get("home_over_15_ft")) >= 80:
            tips.append("📈 Over 1.5 FT")

        if self.safe(team.get("home_over_25_ft")) >= 75:
            tips.append("🔥 Over 2.5 FT")

        if self.safe(team.get("home_btts")) >= 70:
            tips.append("⚽ BTTS forte")

        if self.safe(team.get("home_corners_avg_ft")) >= 6:
            tips.append(f"🚩 Cantos: média {team.get('home_corners_avg_ft')}")

        if self.safe(team.get("home_score_ht_freq")) >= 75:
            tips.append("⚡ Gol no HT")

        return tips[:3]

    # ===============================================================
    # APOSTAS MÚLTIPLAS
    # ===============================================================

    def evaluate_multiple_bets(self, team):

        mult = []

        rpg = self.safe(team.get("rpg"))
        pos = self.safe(team.get("position"))

        if pos <= 5 and rpg >= 1.8 and self.safe(team.get("home_btts")) >= 60:
            mult.append("Vitória + BTTS")

        if pos <= 5 and self.safe(team.get("home_over_25_ft")) >= 70:
            mult.append("Vitória + Over 2.5 FT")

        if pos <= 3 and self.safe(team.get("home_over_25_ft")) <= 40:
            mult.append("Vitória + Under 2.5 FT")

        if self.safe(team.get("home_corners_avg_ft")) >= 6:
            mult.append("Vitória + Over 9.5 cantos")

        if self.safe(team.get("home_btts")) >= 65 and self.safe(team.get("home_over_25_ft")) >= 65:
            mult.append("BTTS + Over 2.5")

        return mult[:3]

    # ===============================================================
    # TIPSTER FINAL (3 LINHAS)
    # ===============================================================

    def generate_tipster_prediction(self, home, away, winprob, trends):

        hp = winprob["home"]
        ap = winprob["away"]

        # Quem é favorito?
        if abs(hp - ap) <= 10:
            fav = f"Partida equilibrada ({hp}% vs {ap}%)."
        elif hp > ap:
            fav = f"Favorito: {home['name']} ({hp}%)."
        else:
            fav = f"Favorito: {away['name']} ({ap}%)."

        # Tendência principal
        if trends["over25"] >= 65:
            tendency = "Tendência forte de gols (Over 2.5)."
        elif trends["btts"] >= 60:
            tendency = "Forte chance de BTTS."
        else:
            tendency = "Gols moderados."

        # Aposta sugerida
        if hp > ap:
            bet = f"Melhor aposta: Vitória {home['name']}."
        elif ap > hp:
            bet = f"Melhor aposta: Vitória {away['name']}."
        else:
            bet = "Melhor aposta: X1/X2."

        return f"{fav}\n{tendency}\n{bet}"


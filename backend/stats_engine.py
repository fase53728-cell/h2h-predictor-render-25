from repositories import TeamRepository

class StatsEngine:

    def __init__(self):
        self.repo = TeamRepository()

    def generate_prediction(self, home, away):
        df_home = self.repo.get_team_data(home)
        df_away = self.repo.get_team_data(away)

        if df_home is None or df_away is None:
            return {"error": "Time não encontrado nos CSVs"}

        result = {
            "home": home,
            "away": away,
            "goals_home": df_home["gf"].mean() if "gf" in df_home else None,
            "goals_away": df_away["gf"].mean() if "gf" in df_away else None,
            "btts_rate": self._calc_btts(df_home, df_away),
            "over_15_rate": self._calc_over(df_home, df_away, 1.5),
            "over_25_rate": self._calc_over(df_home, df_away, 2.5),
        }

        return result

    def _calc_btts(self, df_home, df_away):
        try:
            home_btts = df_home["btts"].mean()
            away_btts = df_away["btts"].mean()
            return round((home_btts + away_btts) / 2, 2)
        except:
            return None

    def _calc_over(self, df_home, df_away, line):
        try:
            h = df_home[f"over_{line}"].mean()
            a = df_away[f"over_{line}"].mean()
            return round((h + a) / 2, 2)
        except:
            return None

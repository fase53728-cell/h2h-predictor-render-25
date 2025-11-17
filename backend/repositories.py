import os
import pandas as pd
from config import CSV_DIR

class TeamRepository:

    def __init__(self):
        self.cache = {}

    def _load_csv(self, team_name):
        filename = f"{team_name}.csv"
        filepath = os.path.join(CSV_DIR, filename)

        if not os.path.exists(filepath):
            return None

        df = pd.read_csv(filepath, sep=";")
        return df

    def get_all_teams(self):
        """Retorna nomes dos times (arquivos CSV)."""
        files = os.listdir(CSV_DIR)
        return [f.replace(".csv", "") for f in files if f.endswith(".csv")]

    def get_team_data(self, team_name):
        """Carrega CSV e retorna DataFrame."""
        if team_name not in self.cache:
            df = self._load_csv(team_name)
            if df is None:
                return None
            self.cache[team_name] = df
        return self.cache[team_name]

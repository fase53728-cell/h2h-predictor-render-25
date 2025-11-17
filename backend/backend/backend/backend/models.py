import os
import csv
import json
from .config import config


class TeamStats:
    """
    Representa todas as estatísticas de um time vindas do CSV padrão (33 colunas).
    """
    def __init__(self, row):
        self.team_name = row.get("team", "")
        self.league = row.get("league", "")
        self.matches = int(row.get("matches", 0))
        self.goals_for = float(row.get("goals_for", 0))
        self.goals_against = float(row.get("goals_against", 0))
        self.ht_goals_for = float(row.get("ht_goals_for", 0))
        self.ht_goals_against = float(row.get("ht_goals_against", 0))
        self.avg_corners_for = float(row.get("corners_for", 0))
        self.avg_corners_against = float(row.get("corners_against", 0))
        self.shots_on = float(row.get("shots_on", 0))
        self.shots_total = float(row.get("shots_total", 0))
        self.cards_yellow = float(row.get("cards_yellow", 0))
        self.cards_red = float(row.get("cards_red", 0))

    def to_dict(self):
        return self.__dict__


class League:
    """
    Representa uma liga com id, temporada, nome e caminho de seus CSVs.
    """
    def __init__(self, data):
        self.name = data["name"]
        self.league_id = data["league_id"]
        self.season_id = data["season_id"]
        self.csv_file = data["csv_file"]

    @staticmethod
    def load_all():
        path = config.LEAGUES_FILE
        if not os.path.exists(path):
            return []
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return [League(item) for item in data]



import os
import csv
from .models import TeamStats, League
from .config import config


class StatsRepository:
    """
    Responsável por carregar dados dos CSVs e salvar atualizações.
    """

    @staticmethod
    def load_team_stats(csv_path):
        """
        Carrega todas as linhas do CSV de uma liga e retorna lista de TeamStats.
        """
        if not os.path.exists(csv_path):
            return []

        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter=";")
            rows = [TeamStats(row) for row in reader]

        return rows

    @staticmethod
    def find_team(csv_path, team_name):
        """
        Encontra um time específico pelo nome (normalizado).
        """
        if not os.path.exists(csv_path):
            return None

        team_name_norm = team_name.strip().lower()

        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter=";")
            for row in reader:
                if row["team"].strip().lower() == team_name_norm:
                    return TeamStats(row)
        return None

    @staticmethod
    def save_top3(league_name, top3_dict):
        """
        Salva o arquivo JSON com os TOP3 de cada liga.
        """
        dir_path = config.TOP3_DIR

        if not os.path.exists(dir_path):
            os.makedirs(dir_path)

        file_path = os.path.join(dir_path, f"{league_name}.json")

        with open(file_path, "w", encoding="utf-8") as f:
            import json
            json.dump(top3_dict, f, indent=4, ensure_ascii=False)

        return file_path

    @staticmethod
    def load_leagues():
        """
        Carrega todas as ligas registradas.
        """
        return League.load_all()


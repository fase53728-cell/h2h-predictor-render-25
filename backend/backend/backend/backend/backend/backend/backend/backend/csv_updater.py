import os
import csv
import json
from sofascore_client import SofaScoreClient

DATA_DIR = "data/csv"
TOP3_DIR = "data/top3"

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(TOP3_DIR, exist_ok=True)


class CSVUpdater:
    """
    Atualiza automaticamente os CSVs de cada liga com dados do SofaScore.
    """
    def __init__(self):
        self.client = SofaScoreClient()

    # ===========================================================
    # LEITURA / ESCRITA CSV
    # ===========================================================

    def read_csv(self, path):
        if not os.path.exists(path):
            return []

        rows = []
        with open(path, newline='', encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter=";")
            for row in reader:
                rows.append(row)
        return rows

    def write_csv(self, path, rows):
        if not rows:
            return

        # garante que todos os campos existam
        fieldnames = sorted(list(rows[0].keys()))

        with open(path, "w", newline='', encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=";")
            writer.writeheader()
            writer.writerows(rows)

    # ===========================================================
    # PROCESSAR UMA LIGA INTEIRA
    # ===========================================================

    def process_league(self, league_code):
        path = os.path.join(DATA_DIR, f"{league_code}.csv")
        rows = self.read_csv(path)

        if not rows:
            print(f"[ERRO] CSV vazio ou inexistente: {league_code}")
            return

        print(f"⏳ Atualizando liga: {league_code} ({len(rows)} times)")

        updated = []

        for row in rows:
            try:
                team_id = int(row.get("team_id"))
                season_id = row.get("season_id")

                if not team_id:
                    print(f"[AVISO] Time sem ID no CSV: {row.get('name')}")
                    continue

                stats = self.client.extract_team_csv_stats(team_id, season_id)

                if not stats:
                    print(f"[ERRO] Falhou para {row['name']} - {team_id}")
                    continue

                # adiciona/atualiza os campos novos
                for key, value in stats.items():
                    row[key] = value

                # baixa logo e salva local
                logo_path = self.client.get_team_logo(team_id)
                if logo_path:
                    row["logo"] = logo_path

                updated.append(row)

            except Exception as e:
                print(f"[ERRO] Time deu erro: {row.get('name')} => {e}")

        # grava CSV completo atualizado
        self.write_csv(path, updated)

        print(f"✅ Liga atualizada: {league_code} ({len(updated)} times)")

    # ===========================================================
    # PROCESSAR TODAS AS LIGAS
    # ===========================================================

    def update_all_leagues(self):
        print("=====================================")
        print(" 🔄 ATUALIZANDO TODAS AS LIGAS... ")
        print("=====================================")

        leagues = [
            f.replace(".csv", "")
            for f in os.listdir(DATA_DIR)
            if f.endswith(".csv")
        ]

        for league in leagues:
            self.process_league(league)

        print("🎉 Todas as ligas foram atualizadas!")

    # ===========================================================
    # GERAR TOP 3 DAS LIGAS
    # ===========================================================

    def generate_top3(self):
        """
        Gera top-3 de cada liga baseado em:
        - Over FT
        - Escanteios FT
        - BTTS
        - Chutes
        """
        leagues = [
            f.replace(".csv", "")
            for f in os.listdir(DATA_DIR)
            if f.endswith(".csv")
        ]

        for league in leagues:
            path = os.path.join(DATA_DIR, f"{league}.csv")
            rows = self.read_csv(path)

            if not rows:
                continue

            try:
                top_over = sorted(rows, key=lambda r: float(r.get("over25", 0)), reverse=True)[:3]
                top_corners = sorted(rows, key=lambda r: float(r.get("corners_total", 0)), reverse=True)[:3]
                top_btts = sorted(rows, key=lambda r: float(r.get("btts", 0)), reverse=True)[:3]
                top_shots = sorted(rows, key=lambda r: float(r.get("shots_total", 0)), reverse=True)[:3]

                output = {
                    "over25": top_over,
                    "corners_ft": top_corners,
                    "btts": top_btts,
                    "shots": top_shots
                }

                with open(f"{TOP3_DIR}/{league}.json", "w", encoding="utf-8") as f:
                    json.dump(output, f, indent=2)

                print(f"Top3 gerado: {league}")

            except:
                print(f"[ERRO] top3 liga {league}")


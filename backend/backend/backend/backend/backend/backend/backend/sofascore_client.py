import requests
import os
import time
import json

BASE_URL = "https://api.sofascore.com/api/v1"


class SofaScoreClient:
    CACHE_FILE = "cache/sofascore_cache.json"
    LOGO_DIR = "public/logos"

    def __init__(self):
        os.makedirs("cache", exist_ok=True)
        os.makedirs(self.LOGO_DIR, exist_ok=True)
        self.cache = self.load_cache()

    # ================================
    # CACHE
    # ================================

    def load_cache(self):
        if not os.path.exists(self.CACHE_FILE):
            return {}
        try:
            with open(self.CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return {}

    def save_cache(self):
        with open(self.CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(self.cache, f, indent=2)

    def get_cached(self, key, ttl=3600):
        """TTL padrão: 1 hora"""
        data = self.cache.get(key)
        if not data:
            return None

        if time.time() - data["timestamp"] > ttl:
            return None

        return data["value"]

    def set_cached(self, key, value):
        self.cache[key] = {
            "timestamp": time.time(),
            "value": value
        }
        self.save_cache()

    # ================================
    # REQUEST
    # ================================

    def get(self, endpoint, ttl=3600):
        key = f"GET:{endpoint}"
        cached = self.get_cached(key, ttl)
        if cached:
            return cached

        url = f"{BASE_URL}/{endpoint}"

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            self.set_cached(key, data)
            return data
        except:
            return None

    # ================================
    # DADOS DO TIME
    # ================================

    def get_team_info(self, team_id):
        return self.get(f"team/{team_id}")

    def get_team_logo(self, team_id):
        info = self.get_team_info(team_id)
        if not info:
            return None

        try:
            logo_url = f"https://api.sofascore.app/api/v1/team/{team_id}/image"
            logo_ext = "png"
            save_path = f"{self.LOGO_DIR}/{team_id}.{logo_ext}"

            if not os.path.exists(save_path):
                img = requests.get(logo_url)
                if img.status_code == 200:
                    with open(save_path, "wb") as f:
                        f.write(img.content)

            return save_path
        except:
            return None

    # ================================
    # ESTATÍSTICAS DE PARTIDAS
    # ================================

    def get_team_season_stats(self, team_id, season_id):
        """
        Puxa estatísticas completas da temporada (inclui chutes, finalizações, escanteios, cartões).
        """
        return self.get(f"team/{team_id}/statistics/season/{season_id}", ttl=3600)

    def get_live_match_stats(self, match_id):
        """Painel Live futuramente"""
        return self.get(f"event/{match_id}/statistics", ttl=10)

    # ================================
    # EXTRATOR DAS ESTATÍSTICAS QUE USAMOS NOS CSV
    # ================================

    def extract_team_csv_stats(self, team_id, season_id):
        """
        Extrai exatamente os campos que vamos gravar no CSV:
        - Over FT
        - Over HT
        - BTTS
        - Chutes
        - Chutes no gol
        - Ataques perigosos
        - Escanteios HT/FT
        - Cartões
        """

        raw = self.get_team_season_stats(team_id, season_id)
        if not raw:
            return None

        stats = raw.get("statistics", {})

        return {
            "team_id": team_id,
            "goals_avg_ft": stats.get("goals", {}).get("for", {}).get("average", 0),
            "goals_avg_ht": stats.get("goals", {}).get("for", {}).get("period1", 0),

            "over15": stats.get("goals", {}).get("scored15", 0),
            "over25": stats.get("goals", {}).get("scored25", 0),
            "btts": stats.get("goals", {}).get("btts", 0),

            "shots_total": stats.get("shots", {}).get("total", 0),
            "shots_on": stats.get("shots", {}).get("onTarget", 0),
            "dangerous_attacks": stats.get("attacks", {}).get("dangerous", 0),

            "corners_total": stats.get("corners", {}).get("total", 0),
            "corners_ht": stats.get("corners", {}).get("period1", 0),

            "cards_yellow": stats.get("cards", {}).get("yellow", 0),
            "cards_red": stats.get("cards", {}).get("red", 0),
        }

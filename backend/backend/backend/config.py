import os

# Configurações básicas do projeto
class Config:
    DEBUG = False
    TESTING = False

    # Pasta onde ficam os CSVs de times
    DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

    # Pasta onde salvamos escudos baixados
    LOGO_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "logos")

    # Pasta onde exportamos JSONs (Top3 / Múltiplas)
    OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")

    # Arquivo das ligas
    LEAGUES_FILE = os.path.join(DATA_DIR, "leagues.json")

    # Exemplo de API do Sofascore (não precisa token)
    SOFASCORE_BASE = "https://sofascore.com/api/v1"

config = Config()

from flask import Flask
from flask_cors import CORS
import os

from routes_api import api  # importa todas as rotas

def create_app():
    app = Flask(__name__)

    # Libera acesso do frontend (Render ou qualquer domínio)
    CORS(app)

    # Registra nossas rotas
    app.register_blueprint(api, url_prefix="/api")

    @app.route("/")
    def home():
        return {
            "status": "running",
            "message": "Backend H2H Predictor ativo",
            "routes": [
                "/api/leagues",
                "/api/teams?league=...",
                "/api/h2h?league=&home=&away=",
                "/api/daily-tips",
                "/api/multiple-bets"
            ]
        }

    return app


if __name__ == "__main__":
    # Render / Replit usa PORT definida em ambiente
    port = int(os.environ.get("PORT", 5000))
    app = create_app()
    app.run(host="0.0.0.0", port=port)

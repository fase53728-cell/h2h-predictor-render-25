from flask import Flask, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# -----------------------------
# ROTA PRINCIPAL DO PAINEL
# -----------------------------
@app.route("/")
def index():
    return render_template("index.html")

# -----------------------------
# RODAR SERVIDOR NO RENDER
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)

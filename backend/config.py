import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CSV_DIR = os.path.join(BASE_DIR, "csv")
if not os.path.exists(CSV_DIR):
    os.makedirs(CSV_DIR)

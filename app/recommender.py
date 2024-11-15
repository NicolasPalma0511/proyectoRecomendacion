from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import manhattan_distances
import redis
import json

app = Flask(__name__)
CORS(app)

# Conectar a Redis
r = redis.Redis(host='redis', port=6379, decode_responses=True)

# Cargar y procesar datos de partituras
df = pd.read_csv("partituras.csv")
df["notas"] = df["notas"].apply(lambda x: " ".join(x.split(",")))
df["claves"] = df["claves"].apply(lambda x: " ".join(x.split(",")))
df["descripcion"] = df["nombre"] + " " + df["autor"] + " " + df["género"] + " " + df["notas"]

vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(df["descripcion"])

# Almacenar las partituras en Redis
for i, row in df.iterrows():
    r.set(f"partitura:{row['id']}", json.dumps(row.to_dict()))

# Endpoint para obtener todas las partituras
@app.route("/partituras", methods=["GET"])
def obtener_partituras():
    partituras = [json.loads(r.get(key)) for key in r.keys("partitura:*")]
    return jsonify(partituras)

# Endpoint para obtener una partitura específica por ID
@app.route("/partituras/<int:sheet_id>", methods=["GET"])
def obtener_partitura(sheet_id):
    partitura = r.get(f"partitura:{sheet_id}")
    if partitura is None:
        return jsonify({"error": "Partitura no encontrada"}), 404
    return jsonify(json.loads(partitura))

# Endpoint para obtener recomendaciones según el ID de una partitura
@app.route("/recomendar", methods=["POST"])
def recomendar_canciones():
    data = request.get_json()
    id_cancion = data.get("id_cancion")
    num_recomendaciones = data.get("num_recomendaciones", 5)

    if id_cancion is None:
        return jsonify({"error": "ID de la canción es necesario"}), 400

    try:
        indice_cancion = df[df["id"] == id_cancion].index[0]
    except IndexError:
        return jsonify({"error": "ID de la canción no encontrado"}), 404

    distancia_manhattan = manhattan_distances(tfidf_matrix[indice_cancion], tfidf_matrix).flatten()
    indices_recomendaciones = distancia_manhattan.argsort()[1:num_recomendaciones + 1]
    recomendaciones = df.iloc[indices_recomendaciones].to_dict(orient="records")

    return jsonify(recomendaciones)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

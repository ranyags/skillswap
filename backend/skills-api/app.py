from flask import Flask, jsonify, request

app = Flask(__name__)

# Route principale
@app.route("/", methods=["GET"])
def home():
    return "Hello, SkillSwap! 🚀"

# Liste des compétences (GET)
@app.route("/api/skills", methods=["GET"])
def get_skills():
    skills = [
        {"id": 1, "name": "Python"},
        {"id": 2, "name": "JavaScript"},
        {"id": 3, "name": "Flask"},
    ]
    return jsonify(skills)

# Ajouter une compétence (POST)
@app.route("/api/skills/add", methods=["POST"])
def add_skill():
    data = request.get_json()
    return jsonify({"message": "Skill added successfully!", "data": data}), 201

# Historique de chat (GET avec ID dynamique)
@app.route("/api/chat/history/<int:chat_id>", methods=["GET"])
def chat_history(chat_id):
    chat_data = {
        "chat_id": chat_id,
        "messages": ["Bonjour!", "Comment ça va?"]
    }
    return jsonify(chat_data)

# Gestion des erreurs 404
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Page not found!"}), 404

# Lancement de l'application Flask
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)

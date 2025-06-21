from flask import Flask, request, jsonify
from flask_mysqldb import MySQL


app = Flask(__name__)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'skillswap'

mysql = MySQL(app)


# Route principale
@app.route("/")
def home():
    return "Hello, SkillSwap! 🚀"

# Ajouter une compétence (POST)
@app.route('/api/skills/add', methods=['POST'])
def add_skill():
    data = request.get_json()
    name = data.get('name')
    level = data.get('level')
    
    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO skills (name, level) VALUES (%s, %s)", (name, level))
    mysql.connection.commit()
    cur.close()
    
    return jsonify({"message": "Skill added successfully!"}), 201

# Récupérer toutes les compétences (GET)
@app.route('/api/skills', methods=['GET'])
def get_skills():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM skills")
    skills = cur.fetchall()
    cur.close()
    return jsonify(skills)

# Gérer les erreurs 404
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Page not found!"}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)

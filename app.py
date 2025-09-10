import os
from flask import Flask, request, render_template, jsonify
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
app = Flask(__name__)

# ----------  INITIALISATION DIFFÉRÉE  ----------
client = None

def get_client():
    global client
    if client is None:
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            raise RuntimeError("OPENAI_API_KEY absente au runtime")
        client = OpenAI(api_key=key)
    return client
# -----------------------------------------------

PORT = int(os.getenv("PORT", 10000))

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate():
    cli = get_client()          # ← instanciation paresseuse
    data     = request.get_json()
    titre    = data["titre"]
    episode  = data["episode"]
    auteur   = data["auteur"]
    contenu  = data["contenu"]
    minWords = data.get("minWords", 300)
    previous = data.get("previous", "")
    is_concl = "conclusion" in contenu.lower()

    prompt = f"""
Tu es un auteur africain talentueux.
Titre : « {titre} »
Épisode {episode} {"(FINAL)" if is_concl else ""}
Auteur : {auteur}
{previous and 'Résumé précédent : ' + previous}
Consignes : {contenu}
Rédige l’épisode {episode} (min {minWords} mots).
{ 'Termine par une morale.' if is_concl else '' }
Signature développeur : Sossou Kouamé.
""".strip()

    try:
        resp = cli.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
            max_tokens=int(minWords * 2.5)
        )
        story = resp.choices[0].message.content
        if "Sossou Kouamé" not in story:
            story += "\n\nDéveloppé par Sossou Kouamé."
        return jsonify({"story": story})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/style", methods=["POST"])
def style():
    cli = get_client()          # ← instanciation paresseuse
    text = request.get_json()["text"]
    try:
        resp = cli.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content":
                      f"Réécris avec des **mots-clés en gras**, *des passages en italique*, "
                      f"des emojis adaptés et un style séduisant :\n\n{text}"}],
            temperature=0.9
        )
        return jsonify({"styled": resp.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)

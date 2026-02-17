import os
from flask import Flask, send_file

app = Flask(__name__)

@app.route("/")
def serve_file():
    return send_file("text.txt", mimetype="text/plain")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)

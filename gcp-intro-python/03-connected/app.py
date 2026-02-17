import os
from flask import Flask
from google.cloud import storage

app = Flask(__name__)

@app.route("/")
def serve_file():
    bucket_name = os.environ["BUCKET_NAME"]
    object_name = os.environ["OBJECT_NAME"]

    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(object_name)

    return blob.download_as_text(), 200, {"Content-Type": "text/plain"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)

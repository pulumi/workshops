from flask import Flask, send_file
import json
import awsgi

app = Flask(__name__)

@app.route("/")
def serve_file():
    return send_file("text.txt", mimetype="text/plain")

# Lambda handler function
def lambda_handler(event, context):
    return awsgi.response(app, event, context)

# For local testing
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)

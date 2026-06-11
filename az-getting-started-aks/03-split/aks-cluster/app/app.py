from flask import Flask, render_template_string
import time

app = Flask(__name__)

@app.route("/")
def random_cat():
    # Append a unique query param so you always get a fresh cat (avoid caching).
    unique_param = int(time.time() * 1000)
    html = f"""
    <!DOCTYPE html>
    <html>
        <head>
            <title>KubeKitties Random Cat</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f5f7fa;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    text-align: center;
                }}
                h1 {{
                    color: #2c3e50;
                    margin-bottom: 30px;
                }}
                img {{
                    max-width: 100%;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }}
                .container {{
                    background-color: white;
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                }}
                button {{
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    margin-top: 25px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background-color 0.3s;
                }}
                button:hover {{
                    background-color: #2980b9;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Enjoy your random container cat!</h1>
                <img src="https://cataas.com/cat?t={unique_param}" alt="Random Cat" />
                <div>
                    <button onclick="window.location.reload()">Refresh Cat</button>
                </div>
            </div>
        </body>
    </html>
    """
    return render_template_string(html)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)

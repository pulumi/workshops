"""server.py — the demo's whole application: a single "hello" endpoint.

Deliberately trivial. The point of this workshop is the supply chain around
the image, not the image's contents.
"""
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"hello from the supply-chain-signing-as-code demo\n")


if __name__ == "__main__":
    HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()

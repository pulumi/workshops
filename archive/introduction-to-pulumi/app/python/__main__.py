import http.server
import socketserver
import os
from http import HTTPStatus


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(HTTPStatus.OK)
        self.end_headers()
        self.wfile.write(b'Hello, world!')



PORT = os.environ.get("LISTEN_PORT")
httpd = socketserver.TCPServer(('', int(PORT)), Handler)
httpd.serve_forever()
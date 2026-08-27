"""Tiny POST sink: the game page POSTs canvas dataURLs here during headless QA.

    python tools/shot_sink.py 5611 docs/shots
"""
import base64
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5611
OUT = sys.argv[2] if len(sys.argv) > 2 else "docs/shots"


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        name = os.path.basename(self.path.strip("/")) or "shot.png"
        if not name.endswith(".png"):
            name += ".png"
        n = int(self.headers.get("Content-Length", 0))
        data = self.rfile.read(n).decode("utf-8", "ignore")
        if "," in data:
            data = data.split(",", 1)[1]
        os.makedirs(OUT, exist_ok=True)
        path = os.path.join(OUT, name)
        with open(path, "wb") as f:
            f.write(base64.b64decode(data))
        self.send_response(200)
        self._cors()
        self.end_headers()
        self.wfile.write(b"ok")
        print("saved", path, flush=True)


HTTPServer(("127.0.0.1", PORT), H).serve_forever()

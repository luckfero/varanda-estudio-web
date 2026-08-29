# -*- coding: utf-8 -*-
"""Regera os PNG da marca a partir dos SVG, com fundo TRANSPARENTE.

Os PNG existem porque rede social e cliente de e-mail nao aceitam SVG. Eles sao
derivados: quem manda e o SVG, e nenhum deles deve ser editado a mao.

O `simbolo.svg` pinta por currentColor, que fora da pagina cai em preto. Aqui
ele e embutido num HTML que declara a cor, e por isso o PNG sai na tinta certa
e nao em preto puro.

COMO RODAR, da raiz do projeto:  python scripts/gerar-pngs-marca.py
"""
import base64, json, os, pathlib, subprocess, sys, time, urllib.request, socket
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORTA = int(os.environ.get("CDP_PORTA", 9401))
RAIZ = pathlib.Path(__file__).resolve().parent.parent
MARCA = RAIZ / "public/marca"
TMP = pathlib.Path(os.environ.get("TEMP", ".")) / "marca-png"
TMP.mkdir(parents=True, exist_ok=True)

import websocket

# arquivo de origem, saida, largura, cor herdada (para o currentColor)
PECAS = [
    ("assinatura.svg",       "assinatura-1200.png",       1200, None),
    ("assinatura-claro.svg", "assinatura-claro-1200.png", 1200, None),
    ("selo.svg",             "perfil-512.png",             512, None),
    ("selo.svg",             "perfil-256.png",             256, None),
    ("selo-claro.svg",       "perfil-claro-512.png",       512, None),
    ("simbolo.svg",          "simbolo-512.png",            512, "#14110e"),
    ("simbolo.svg",          "simbolo-256.png",            256, "#14110e"),
    ("simbolo-claro.svg",    "simbolo-claro-512.png",      512, None),
]


def subir(w, h):
    p = subprocess.Popen([CHROME, "--headless", "--disable-gpu", "--no-sandbox",
        "--hide-scrollbars", "--remote-allow-origins=*",
        "--remote-debugging-port=%d" % PORTA, "--window-size=%d,%d" % (w, h),
        "--user-data-dir=%s" % (TMP / "perfil"), "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(80):
        try:
            urllib.request.urlopen("http://127.0.0.1:%d/json/version" % PORTA, timeout=1)
            return p
        except Exception:
            time.sleep(.25)
    raise SystemExit("Chrome nao subiu")


class Aba:
    def __init__(self):
        alvos = json.load(urllib.request.urlopen("http://127.0.0.1:%d/json" % PORTA))
        url = [a for a in alvos if a["type"] == "page"][0]["webSocketDebuggerUrl"]
        self.ws = websocket.create_connection(url, timeout=40); self.n = 0

    def cmd(self, metodo, **p):
        self.n += 1
        self.ws.send(json.dumps({"id": self.n, "method": metodo, "params": p}))
        while True:
            m = json.loads(self.ws.recv())
            if m.get("id") == self.n:
                if "error" in m: raise RuntimeError(m["error"])
                return m.get("result", {})


proc = subir(1400, 900)
try:
    a = Aba(); a.cmd("Page.enable"); a.cmd("Runtime.enable")
    for origem, saida, largura, cor in PECAS:
        svg = (MARCA / origem).read_text(encoding="utf-8")
        # a proporcao vem do proprio viewBox, para o PNG nunca distorcer
        vb = svg.split('viewBox="')[1].split('"')[0].split()
        prop = float(vb[3]) / float(vb[2])
        altura = round(largura * prop)
        estilo = ("color:%s;--marca-luz:%s;" % (cor, cor)) if cor else ""
        html = ("""<!doctype html><meta charset="utf-8"><style>
          html,body{margin:0;padding:0;background:transparent}
          svg{display:block;width:%dpx;height:%dpx;%s}</style>%s"""
          % (largura, altura, estilo, svg))
        alvo = TMP / (saida + ".html")
        alvo.write_text(html, encoding="utf-8")
        a.cmd("Emulation.setDeviceMetricsOverride", width=largura, height=altura,
              deviceScaleFactor=1, mobile=False)
        # fundo transparente de verdade: sem isto o Chrome pinta branco
        a.cmd("Emulation.setDefaultBackgroundColorOverride",
              color={"r": 0, "g": 0, "b": 0, "a": 0})
        a.cmd("Page.navigate", url=alvo.as_uri()); time.sleep(.9)
        r = a.cmd("Page.captureScreenshot", format="png",
                  clip={"x": 0, "y": 0, "width": largura, "height": altura, "scale": 1})
        dados = base64.b64decode(r["data"])
        (MARCA / saida).write_bytes(dados)
        print("  %-28s %4d x %-4d  %5.1f KB  (de %s)"
              % (saida, largura, altura, len(dados) / 1024, origem))
finally:
    proc.terminate()

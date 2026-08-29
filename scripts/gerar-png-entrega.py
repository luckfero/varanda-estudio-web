# -*- coding: utf-8 -*-
"""Gera a pasta de PNG para uso fora do projeto.

Nome de arquivo que diz PARA QUE SERVE, e nao o nome interno da peca: quem
abre a pasta para mandar um logo nao deveria precisar ler documentacao.

Cada peca sai em fundo transparente e tambem com fundo solido. O transparente
e melhor quando se sabe onde vai; o com fundo evita o acidente de colar um
logo creme num documento branco e ele sumir.

COMO RODAR, da raiz do projeto:  python scripts/gerar-png-entrega.py
"""
import base64, json, os, pathlib, subprocess, time, urllib.request
import websocket

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORTA = int(os.environ.get("CDP_PORTA", 9411))
RAIZ = pathlib.Path(__file__).resolve().parent.parent
MARCA = RAIZ / "public/marca"
DESTINO = RAIZ.parent / "marca" / "logotipo-png"
TMP = pathlib.Path(os.environ.get("TEMP", ".")) / "png-entrega"
TMP.mkdir(parents=True, exist_ok=True)
DESTINO.mkdir(parents=True, exist_ok=True)

BRANCO, ESCURO = "#ffffff", "#14110e"

# (svg de origem, prefixo do nome, larguras, cor herdada, fundo solido ou None)
PECAS = [
    ("assinatura.svg",       "logo-completo-para-fundo-claro",  [512, 1024, 2048], None, None),
    ("assinatura-claro.svg", "logo-completo-para-fundo-escuro", [512, 1024, 2048], None, None),
    ("assinatura.svg",       "logo-completo-com-fundo-branco",  [1024, 2048], None, BRANCO),
    ("assinatura-claro.svg", "logo-completo-com-fundo-escuro",  [1024, 2048], None, ESCURO),
    ("simbolo.svg",          "simbolo-para-fundo-claro",  [256, 512, 1024], "#14110e", None),
    ("simbolo-claro.svg",    "simbolo-para-fundo-escuro", [256, 512, 1024], None, None),
    ("selo.svg",             "selo-escuro-para-perfil",   [256, 512, 1024], None, None),
    ("selo-claro.svg",       "selo-claro-para-perfil",    [256, 512, 1024], None, None),
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


proc = subir(2200, 1400)
feitos = 0
try:
    a = Aba(); a.cmd("Page.enable"); a.cmd("Runtime.enable")
    for origem, prefixo, larguras, cor, fundo in PECAS:
        svg = (MARCA / origem).read_text(encoding="utf-8")
        vb = svg.split('viewBox="')[1].split('"')[0].split()
        prop = float(vb[3]) / float(vb[2])
        for largura in larguras:
            altura = round(largura * prop)
            # com fundo solido a peca ganha respiro: 12% da altura de cada lado
            respiro = round(altura * 0.12) if fundo else 0
            cx, cy = largura + respiro * 2, altura + respiro * 2
            estilo = ("color:%s;--marca-luz:%s;" % (cor, cor)) if cor else ""
            html = ("""<!doctype html><meta charset="utf-8"><style>
              html,body{margin:0;padding:0;background:%s}
              .c{width:%dpx;height:%dpx;display:flex;align-items:center;justify-content:center}
              svg{display:block;width:%dpx;height:%dpx;%s}</style>
              <div class="c">%s</div>"""
              % (fundo or "transparent", cx, cy, largura, altura, estilo, svg))
            alvo = TMP / "peca.html"
            alvo.write_text(html, encoding="utf-8")
            a.cmd("Emulation.setDeviceMetricsOverride", width=cx, height=cy,
                  deviceScaleFactor=1, mobile=False)
            a.cmd("Emulation.setDefaultBackgroundColorOverride",
                  color={"r": 0, "g": 0, "b": 0, "a": 0})
            a.cmd("Page.navigate", url=alvo.as_uri() + "?v=%d" % largura)
            time.sleep(.75)
            r = a.cmd("Page.captureScreenshot", format="png",
                      clip={"x": 0, "y": 0, "width": cx, "height": cy, "scale": 1})
            dados = base64.b64decode(r["data"])
            nome = "%s-%d.png" % (prefixo, largura)
            (DESTINO / nome).write_bytes(dados)
            feitos += 1
            print("  %-46s %4d x %-4d %6.1f KB" % (nome, cx, cy, len(dados) / 1024))
finally:
    proc.terminate()
print("  %d arquivos em %s" % (feitos, DESTINO))

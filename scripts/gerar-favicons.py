# -*- coding: utf-8 -*-
"""Regera os favicons raster a partir da geometria da marca.

O `favicon.svg` troca de cor conforme o tema da aba, e PNG nao faz isso. Entao
cada arquivo raster e gerado na cor que serve ao lugar onde ele aparece:

  favicon.ico, favicon-48, favicon-96  tinta escura sobre transparente.
      Sao os que o buscador mostra, e resultado de busca e fundo branco.
  apple-touch-icon                     creme sobre o chao solido.
      O iOS compoe o icone na tela inicial e PNG transparente sai com fundo
      PRETO, entao este precisa de fundo proprio. O iOS arredonda a quina
      sozinho, por isso o quadrado aqui e reto.

COMO RODAR, da raiz do projeto:  python scripts/gerar-favicons.py
DEPOIS: subir o `?v=` em `app/raiz.tsx`, senao nao chega em quem ja visitou.
"""
import base64, json, os, pathlib, subprocess, time, urllib.request
import websocket
from PIL import Image

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORTA = int(os.environ.get("CDP_PORTA", 9421))
RAIZ = pathlib.Path(__file__).resolve().parent.parent
PUB = RAIZ / "public"
TMP = pathlib.Path(os.environ.get("TEMP", ".")) / "favicons"
TMP.mkdir(parents=True, exist_ok=True)

# A geometria canonica, a mesma de marca/simbolo.svg e do componente ArcoMark.
GEO = """<path d="M16 35V24a9 9 0 0 1 9-9h14a9 9 0 0 1 9 9v11" fill="none"
      stroke="{t}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 49h40" fill="none" stroke="{t}" stroke-width="5" stroke-linecap="round"/>
  <path d="M24 46.5a8 8 0 0 1 16 0Z" fill="{s}"/>"""

# (saida, lado, traco, sol, fundo)
PECAS = [
    ("favicon-96.png", 96, "#14110e", "#14110e", None),
    ("favicon-48.png", 48, "#14110e", "#14110e", None),
    ("apple-touch-icon.png", 180, "#f4efe6", "#e8a33c", "#14110e"),
]
ICO = [16, 32, 48]


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


def render(a, lado, traco, sol, fundo, destino):
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">%s</svg>'
           % GEO.format(t=traco, s=sol))
    html = ("""<!doctype html><meta charset="utf-8"><style>
      html,body{margin:0;padding:0;background:%s}
      svg{display:block;width:%dpx;height:%dpx}</style>%s"""
      % (fundo or "transparent", lado, lado, svg))
    alvo = TMP / "peca.html"; alvo.write_text(html, encoding="utf-8")
    a.cmd("Emulation.setDeviceMetricsOverride", width=lado, height=lado,
          deviceScaleFactor=1, mobile=False)
    a.cmd("Emulation.setDefaultBackgroundColorOverride", color={"r":0,"g":0,"b":0,"a":0})
    a.cmd("Page.navigate", url=alvo.as_uri() + "?v=%d%s" % (lado, traco[1:]))
    time.sleep(.8)
    r = a.cmd("Page.captureScreenshot", format="png",
              clip={"x":0,"y":0,"width":lado,"height":lado,"scale":1})
    dados = base64.b64decode(r["data"])
    pathlib.Path(destino).write_bytes(dados)
    return len(dados)


proc = subir(400, 400)
try:
    a = Aba(); a.cmd("Page.enable"); a.cmd("Runtime.enable")
    for nome, lado, traco, sol, fundo in PECAS:
        n = render(a, lado, traco, sol, fundo, PUB / nome)
        print("  %-24s %3dpx  %5.1f KB  %s" % (nome, lado, n/1024,
              "sobre %s" % fundo if fundo else "transparente"))
    # O .ico guarda varios tamanhos num arquivo so. O Pillow REAMOSTRA a
    # imagem que recebe para cada tamanho da lista, entao quem entra tem que
    # ser a MAIOR: passando a de 16px, os tres saem em 16 e o arquivo fica com
    # um tamanho so. Foi o que aconteceu na primeira tentativa, e so apareceu
    # ao ler `info["sizes"]` do arquivo gravado.
    maior = TMP / "ico-maior.png"
    render(a, max(ICO), "#14110e", "#14110e", None, maior)
    Image.open(maior).convert("RGBA").save(
        PUB / "favicon.ico", format="ICO", sizes=[(l, l) for l in ICO])
    print("  %-24s %s  %5.1f KB" % ("favicon.ico", "+".join(str(l) for l in ICO),
          (PUB / "favicon.ico").stat().st_size/1024))
finally:
    proc.terminate()

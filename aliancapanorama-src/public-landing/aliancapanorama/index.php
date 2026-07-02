<?php
// Redirect para o app principal (Vercel) se disponível
$app_url = "https://aliancapanorama.vercel.app";
// Detecta se é um crawler para servir HTML estático
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
$is_bot = preg_match('/bot|crawl|slurp|spider|facebookexternalhit|twitterbot/i', $ua);
if (!$is_bot) {
  header("Location: $app_url", true, 302);
  exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Aliança Panorama — Plataforma gamificada para o vestibular FUVEST 2026. Aprenda com a Sociedade Tucci." />
  <meta property="og:title" content="Aliança Panorama · FUVEST 2026" />
  <meta property="og:description" content="Sua jornada rumo à USP começa aqui. Plataforma gamificada com IA." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://sociedadetucci.com.br/aliancapanorama/" />
  <title>Aliança Panorama · FUVEST 2026 · Sociedade Tucci</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      background: #000;
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .stars {
      position: fixed; inset: 0; z-index: 0;
      background: radial-gradient(ellipse at bottom, #0d1b2a 0%, #000 100%);
    }
    .stars::before {
      content: '';
      position: absolute; inset: 0;
      background-image:
        radial-gradient(1px 1px at 10% 20%, white 0%, transparent 100%),
        radial-gradient(1px 1px at 30% 50%, white 0%, transparent 100%),
        radial-gradient(1px 1px at 60% 10%, white 0%, transparent 100%),
        radial-gradient(1px 1px at 80% 70%, white 0%, transparent 100%),
        radial-gradient(1px 1px at 50% 90%, white 0%, transparent 100%),
        radial-gradient(1px 1px at 90% 30%, white 0%, transparent 100%);
      opacity: 0.6;
    }
    .card {
      position: relative; z-index: 1;
      text-align: center;
      padding: 3rem 2.5rem;
      max-width: 480px;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 1rem;
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(10px);
    }
    .emoji { font-size: 3.5rem; margin-bottom: 1.5rem; display: block; }
    h1 { font-size: 1.5rem; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
    .subtitle { color: rgba(255,255,255,0.4); font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2rem; }
    p { color: rgba(255,255,255,0.6); font-size: 0.9rem; line-height: 1.7; margin-bottom: 2rem; }
    .btn {
      display: inline-block;
      padding: 0.75rem 2rem;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 0.5rem;
      color: #fff;
      text-decoration: none;
      font-size: 0.85rem;
      font-family: inherit;
      transition: background 0.2s;
      cursor: pointer;
    }
    .btn:hover { background: rgba(255,255,255,0.18); }
    .loading { color: rgba(255,255,255,0.3); font-size: 0.7rem; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="stars"></div>
  <div class="card">
    <span class="emoji">🚀</span>
    <h1>Aliança Panorama</h1>
    <p class="subtitle">Sociedade Tucci · FUVEST 2026</p>
    <p>Plataforma gamificada de estudos para o vestibular. Aprenda com inteligência artificial, suba de tier e chegue à USP.</p>
    <a href="https://aliancapanorama.vercel.app" class="btn">Acessar plataforma →</a>
    <p class="loading">redirecionando automaticamente…</p>
  </div>
  <script>
    // Redireciona imediatamente para o app Vercel
    setTimeout(function() {
      window.location.href = "https://aliancapanorama.vercel.app";
    }, 1200);
  </script>
</body>
</html>

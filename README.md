# OpenView IPTV — Landing page

Página estática (sem build) que apresenta a app e oferece o download direto do APK.

- `index.html` — estrutura (hero, funcionalidades, instalação, CTA)
- `styles.css` — tema escuro, fundo aurora animado, glassmorphism, reveal ao scroll
- `script.js` — busca a última versão/asset via API do GitHub (fallback no link estático) e anima o reveal
- `favicon.svg` — ícone (botão play em gradiente)

## Download

O botão aponta para a última release pública:
`https://github.com/LuisPCFialho/openview-releases/releases/latest/download/app-release.apk`

`script.js` substitui o link pelo asset `.apk` exato da última release (e mostra a versão).

## Deploy (Vercel)

Site estático — sem framework. Basta:

```bash
npx vercel --prod --yes
```

A configuração está em `vercel.json` (output estático na raiz). Quando comprares um
domínio, liga-o ao projeto no painel da Vercel.

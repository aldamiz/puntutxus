# Puntutxus

Otra forma de ganar puntutxus.

Web mobile-first para preparar la nutrición de la Batalla de Rande 2026 (27 km, 15°C, 20 junio).

## Estructura

```
public/        Frontend estático (HTML + CSS + JS vanilla)
  index.html   SPA con todas las vistas
  styles.css   Sistema de diseño (azul mar + oro)
  app.js       Estado, routing, lógica, LLM, voz
  manifest.json
  puntutxu.svg

src/
  index.js     Cloudflare Worker que proxea a Groq Llama 3.3 70B

wrangler.toml  Config del Worker
```

## Stack

- Frontend: HTML/CSS/JS vanilla, mobile-first, PWA
- Backend: Cloudflare Worker (`puntutxus-chat.aldamiz.workers.dev`) → Groq
- LLM: Groq + Llama 3.3 70B (gratis)
- Persistencia: localStorage (cada dispositivo guarda lo suyo)
- Voz: Web Speech API

## Deploy

### Worker (LLM proxy)

```bash
./node_modules/.bin/wrangler deploy
```

La key de Groq se guarda como secret de Cloudflare (`GROQ_API_KEY`), nunca en el repo.

Para rotar la key:

```bash
echo "nueva_key" | ./node_modules/.bin/wrangler secret put GROQ_API_KEY
```

### Frontend

Se publica como subdirectorio en `aldamiz/aldamiz-lab` → sirve en `lab.aldamiz.com/puntutxus`.

Cuando el dominio `puntutxus.com` esté listo, se apunta a GitHub Pages del propio repo.

## Datos sensibles

- API key de Groq: en Cloudflare Worker como secret (encriptada).
- No hay base de datos remota. Todo en localStorage del dispositivo.

## Lógica de puntutxus

Cada entreno puede ganar hasta 2 puntutxus:

1. **Puntutxu de preparación** (PRE): si todas las preguntas nutricionales están en la respuesta correcta. El café (`dur_cafe`) no penaliza, solo genera aviso.
2. **Puntutxu de estómago** (POST): si no vomitó y el intestino fue bien. Los pedos no quitan puntutxu, solo generan tip.

## Identidad

- **Txifon** entra con pw `1234`. Sesión válida 90 días.
- **Amigos** entran libres, comparten contador anónimo en su dispositivo.

## Productos analizados

- Gel NUT-GEL Lemon Energy: gel base, sin cafeína
- Gel NUT-GEL Strawberry Stiml Red: con cafeína, uso limitado
- Sub9 Salts (226ers): pastillas de sodio
- Protein Boom Cookies & Cream: ⚠️ NO durante la travesía

## Modo día Rande

El 20 de junio de 2026 la home cambia a un layout especial.

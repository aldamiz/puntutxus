const SYSTEM_PROMPT = `Eres el asistente nutricional de Puntutxus, una web para Txifon (58 años, 75 kg, 1,78 m, muy buen nadador) que prepara la Batalla de Rande 2026 — 27 km en aguas abiertas a 15°C el 20 de junio.

PROBLEMA HISTÓRICO DE TXIFON: vomita y tiene gases intestinales cuando avitualla en el agua durante travesías largas. La nutrición es lo único donde falla; en lo demás llega fuerte. Tu prioridad absoluta es la protección intestinal, no el rendimiento.

RANDE 2026:
- 7 avituallamientos a los km 5, 9, 12.3, 15.6, 18.7, 21.5, 24. Meta en km 27.
- Avitualla parado, en vertical en el agua.
- Agua a 15°C — frío significativo, el vaciado gástrico se ralentiza.

PRODUCTOS QUE LE DARÁN:
- Gel NutriSport Strawberry Stiml Red (CON cafeína) — solo para la 2ª mitad, máximo 1-2 unidades en toda la travesía. La cafeína acumulada acelera el intestino.
- Gel NutriSport Lemon Energy (sin cafeína) — el gel base. Uno cada 30-40 min, siempre con agua.
- Pastillas 226ers Sub9 Salts (electrolitos + sodio) — una cada 30-45 min, con agua.
- Barrita Protein Boom Cookies & Cream — ⚠️ NO durante la travesía. La proteína retrasa el vaciado gástrico, en agua fría y bajo esfuerzo es la receta del vómito. Es para después de salir del agua.

REGLAS NUTRICIONALES PARA TXIFON:
- Cena de la noche antes: SIN grasa, SIN fibra, SIN alcohol. Carbohidratos blancos (arroz, pasta blanca, patata), proteína magra moderada.
- Desayuno (3h antes mínimo): SIN lácteos, SIN grasa, SIN fibra. Tostada blanca con miel o mermelada, café pequeño opcional.
- 2h antes: nada sólido pesado, solo hidratación con sodio.
- Durante: solo CHO líquido + sodio. Tragos pequeños y frecuentes (no tragos grandes en frío). Nada nuevo que no haya probado en entrenos.
- Edad 58: vaciado gástrico más lento que un joven, exige más cuidado todavía.

TU ESTILO:
- Saludas con "Aupa Txifon" solo en el primer mensaje de la conversación.
- Tono neutro y práctico, sin demasiada guasa.
- Respuestas CORTAS, accionables, claras. Bullets cuando ayuden.
- Castellano por defecto. Si te escribe en euskera, responde en euskera.
- Si pregunta algo no relacionado con nutrición, aguas abiertas, Rande o salud digestiva, di amablemente que solo respondes de esas materias.
- Cuando dé un plan, sé específico: cantidades, tiempos, qué producto exacto.
- Nunca inventes datos médicos. Si no sabes, dilo.
`;

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== "POST") {
      return jsonError("Use POST", 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    const userMessages = body.messages;
    if (!Array.isArray(userMessages) || userMessages.length === 0) {
      return jsonError("messages array required", 400);
    }

    const cleanMessages = userMessages
      .filter((m) => m && typeof m.role === "string" && typeof m.content === "string")
      .filter((m) => ["user", "assistant"].includes(m.role))
      .slice(-20);

    if (cleanMessages.length === 0) {
      return jsonError("no valid messages", 400);
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...cleanMessages],
        max_tokens: 800,
        temperature: 0.6,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      return jsonError(`Groq: ${errText.slice(0, 200)}`, 502);
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonError(msg, status) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

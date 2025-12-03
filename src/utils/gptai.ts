// filename: mod.ts (Deno)
// Chú ý: Set 2 env vars on your host:
//   VITE_OPENAI_API_KEY  -> server-side OpenAI key (never exposed to clients)
//   CLIENT_SECRET   -> secret that clients (e.g., your Custom GPT or axios) must send in header Apikey

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(obj: unknown, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const clientKey = req.headers.get("Apikey") || req.headers.get("X-Api-Key") || null;
    const CLIENT_SECRET = Deno.env.get("CLIENT_SECRET") ?? null;
    if (!CLIENT_SECRET) {
      console.error("Server misconfiguration: CLIENT_SECRET not set");
      return jsonResponse({ error: "Server misconfiguration" }, 500);
    }

    // Validate client key
    if (!clientKey || clientKey !== CLIENT_SECRET) {
      return jsonResponse({ error: "Unauthorized: invalid Apikey" }, 401);
    }

    // Read input (GET query or JSON body)
    let title: string | null = null;
    let author: string | null = null;
    let description: string | null = null;

    if (req.method === "GET") {
      const url = new URL(req.url);
      title = url.searchParams.get("title");
      author = url.searchParams.get("author");
      description = url.searchParams.get("description");
    } else {
      // POST/PUT...
      const body = await req.json().catch(() => ({}));
      title = body?.title ?? null;
      author = body?.author ?? null;
      description = body?.description ?? null;
    }

    if (!title || !author) {
      return jsonResponse({ error: "Title and author are required" }, 400);
    }

    const VITE_OPENAI_API_KEY = Deno.env.get("VITE_OPENAI_API_KEY");
    if (!VITE_OPENAI_API_KEY) {
      console.error("VITE_OPENAI_API_KEY missing");
      return jsonResponse({ error: "Server configuration error: VITE_OPENAI_API_KEY is not set" }, 500);
    }

    // Build system + user prompt (tiếng Việt)
    const prompt = `Tạo một bản tóm tắt chi tiết và hấp dẫn cho cuốn sách "${title}" của tác giả ${author}. ${description ? `Mô tả: ${description}` : ''}

Hãy bao gồm:
1. Tóm tắt nội dung chính (2-3 đoạn)
2. Các chủ đề và ý tưởng chính
3. Đối tượng độc giả phù hợp
4. Những điểm nổi bật đặc biệt

Viết bằng tiếng Việt, phong cách chuyên nghiệp nhưng dễ hiểu.`;

    // Call OpenAI Chat Completions
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Bạn là một chuyên gia phân tích và tóm tắt sách chuyên nghiệp." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text().catch(() => "");
      console.error("OpenAI API error:", aiResponse.status, errText);
      // trả fallback summary nhưng báo lỗi (status 200 để client vẫn nhận body; bạn có thể đổi sang 502)
      return jsonResponse({
        error: "OpenAI request failed",
        details: `OpenAI responded with status ${aiResponse.status}`,
        summary: `Cuốn sách "${title}" của tác giả ${author} là một tác phẩm đáng chú ý. ${description ?? ""}`,
      }, 200);
    }

    const data = await aiResponse.json().catch(() => ({}));
    const summary =
      (data?.choices && data.choices[0] && (data.choices[0].message?.content ?? data.choices[0].text)) ||
      `Cuốn sách "${title}" của tác giả ${author}.`;

    return jsonResponse({ summary }, 200);
  } catch (err) {
    console.error("Unhandled error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: "Internal server error", message }, 500);
  }
});

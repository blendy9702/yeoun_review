import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type WebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: ReviewRow | null;
  old_record?: ReviewRow | null;
};

type ReviewRow = {
  id?: string;
  created_at?: string;
  name?: string;
  age?: number;
  mbti?: string;
  concentration?: string;
  review?: string;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

Deno.serve(async (req: Request) => {
  // 브라우저 주소창은 GET만 보냄 → 웹훅은 항상 POST
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        ok: true,
        name: "yeoun_review_bot",
        hint: "이 URL은 Database Webhook(POST) 전용입니다. 브라우저로 열면 GET이라 이 메시지가 보입니다.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      },
    );
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // 공용 TELEGRAM_* 와 충돌하지 않도록 리뷰 전용 시크릿 이름 사용
  const secret = Deno.env.get("YEOUN_REVIEW_WEBHOOK_SECRET");
  const headerSecret = req.headers.get("x-webhook-secret") ?? "";

  if (!secret || headerSecret !== secret) {
    console.error(
      "yeoun_review_bot: secret mismatch or YEOUN_REVIEW_WEBHOOK_SECRET empty",
    );
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = Deno.env.get("YEOUN_REVIEW_TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("YEOUN_REVIEW_TELEGRAM_CHAT_ID");

  if (!token || !chatId) {
    console.error(
      "Missing YEOUN_REVIEW_TELEGRAM_BOT_TOKEN or YEOUN_REVIEW_TELEGRAM_CHAT_ID",
    );
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: WebhookPayload;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const eventType = String(payload.type ?? "").toUpperCase();
  const tableName = String(payload.table ?? "").toLowerCase();
  if (eventType !== "INSERT" || tableName !== "reviews") {
    console.log(
      "yeoun_review_bot: skip (not INSERT on reviews)",
      JSON.stringify({ type: payload.type, table: payload.table }),
    );
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const row = payload.record;
  if (!row?.name) {
    console.error("yeoun_review_bot: INSERT but record.name missing", {
      keys: row ? Object.keys(row) : [],
    });
    return new Response(JSON.stringify({ error: "No record" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("yeoun_review_bot: sending Telegram for review id", row.id);

  const lines = [
    "<b>새 리뷰 등록</b>",
    "",
    `<b>이름 :</b> ${escapeHtml(String(row.name))}`,
    `<b>나이 :</b> ${row.age ?? "-"}`,
    `<b>MBTI :</b> ${escapeHtml(String(row.mbti ?? ""))}`,
    `<b>부향률 :</b> ${escapeHtml(String(row.concentration ?? ""))}`,
    `<b>리뷰 :</b>`,
    escapeHtml(String(row.review ?? "")),
    "",
    `<i>${escapeHtml(row.id ?? "")}</i>`,
  ];

  const text = lines.join("\n");

  const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  const tgRes = await fetch(tgUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!tgRes.ok) {
    const errText = await tgRes.text();
    console.error(
      "yeoun_review_bot: Telegram API error:",
      tgRes.status,
      errText,
    );
    return new Response(
      JSON.stringify({ error: "Telegram failed", detail: errText }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

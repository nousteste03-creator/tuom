import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const { file } = await req.json();

    if (!file || !file.content) {
      return new Response(
        JSON.stringify({ transactions: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const SYSTEM_PROMPT = `
You are a financial document parser specialized in credit card and bank invoices.

Task:
- Extract ONLY individual transactions from invoices
- Normalize transactions into JSON array

Rules:
- Ignore totals, summaries, taxes, fees, headers
- Amounts must be NEGATIVE for expenses
- Dates in ISO format (YYYY-MM-DD) if available
- Currency inferred when possible (default BRL)
- Description must be clean merchant/provider name
- Do NOT hallucinate data

If nothing is detected, return an empty array.
Return JSON array only.
`;

    const USER_PROMPT = `
Invoice content (may include OCR text or raw text):

${file.content}
`;

    const aiResponse = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          temperature: 0,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: USER_PROMPT },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      return new Response(
        JSON.stringify({ transactions: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const aiJson = await aiResponse.json();
    let transactions: any[] = [];

    try {
      transactions = JSON.parse(aiJson.choices[0].message.content);
      if (!Array.isArray(transactions)) transactions = [];
    } catch {
      transactions = [];
    }

    return new Response(
      JSON.stringify({ transactions }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ transactions: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
});

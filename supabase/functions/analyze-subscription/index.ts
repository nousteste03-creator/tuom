import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

serve(async (req) => {
  try {
    const { transactions, metadata } = await req.json();

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return new Response(
        JSON.stringify({ error: "NO_TRANSACTIONS" }),
        { status: 400 }
      );
    }

    const SYSTEM_PROMPT = `
You are a financial analysis engine focused on ONE subscription provider.

Goal:
- Interpret recurring behavior
- Detect billing cycle and stability
- Provide analytical context, not recommendations

Return JSON with:
- provider_name
- category
- billing_cycle
- average_monthly_cost
- annual_cost_estimated
- price_trend
- price_variation_detected
- price_change_frequency
- market_signal
- risk_of_price_increase
- risk_reason

Return JSON only.
Do NOT give advice.
Do NOT hallucinate.
`;

    const USER_PROMPT = `
Transactions related to a single provider:

${JSON.stringify(transactions, null, 2)}

Metadata:
${JSON.stringify(metadata ?? {}, null, 2)}

Return JSON only.
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
          temperature: 0.2,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: USER_PROMPT },
          ],
        }),
      }
    );

    const aiJson = await aiResponse.json();
    const analysis = JSON.parse(aiJson.choices[0].message.content);

    return new Response(
      JSON.stringify(analysis),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "ANALYSIS_FAILED" }),
      { status: 500 }
    );
  }
});

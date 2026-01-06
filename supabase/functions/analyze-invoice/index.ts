import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

serve(async (req) => {
  try {
    const { transactions, invoiceMetadata } = await req.json();

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return new Response(
        JSON.stringify({ error: "NO_TRANSACTIONS" }),
        { status: 400 }
      );
    }

    /**
     * MÉTRICAS DETERMINÍSTICAS (SEM IA)
     */
    const totalMonthly = Math.abs(
      transactions.reduce((acc, t) => acc + (t.amount || 0), 0)
    );

    const annualEstimated = totalMonthly * 12;

    const chargesCount = transactions.length;

    /**
     * IA — INTERPRETAÇÃO CONSOLIDADA
     */
    const SYSTEM_PROMPT = `
You are a financial intelligence engine analyzing a FULL INVOICE
containing multiple recurring subscriptions.

Your role:
- Analyze aggregated behavior
- Detect global billing patterns
- Interpret price behavior and market context

Return JSON with:
- billing_pattern_summary
- price_trend
- price_variation_detected
- price_change_frequency
- market_signal
- news_based_price_pressure
- risk_of_price_increase
- risk_reason

Do NOT recommend actions.
Do NOT judge value.
Do NOT hallucinate.
Return JSON only.
`;

    const USER_PROMPT = `
Aggregated transactions extracted from an invoice:

${JSON.stringify(transactions, null, 2)}

Invoice metadata:
${JSON.stringify(invoiceMetadata ?? {}, null, 2)}

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
          temperature: 0.15,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: USER_PROMPT },
          ],
        }),
      }
    );

    const aiJson = await aiResponse.json();
    const interpretation = JSON.parse(aiJson.choices[0].message.content);

    /**
     * PAYLOAD FINAL DA TELA DE IMERSÃO
     */
    return new Response(
      JSON.stringify({
        invoice_name: invoiceMetadata?.name ?? "Fatura analisada",
        currency: "BRL",
        monthly_total: totalMonthly,
        annual_total: annualEstimated,
        charges_detected_count: chargesCount,
        ...interpretation,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "INVOICE_ANALYSIS_FAILED" }),
      { status: 500 }
    );
  }
});

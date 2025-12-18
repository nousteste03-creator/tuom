import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY not found in environment variables");
}

interface WelcomeEmailPayload {
  email: string;
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const { email }: WelcomeEmailPayload = await req.json();

    if (!email) {
      return new Response("Missing email", { status: 400 });
    }

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>NÖUS Finance</title>
</head>

<body style="margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#000000">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="padding:48px 32px;">

          <!-- LOGO -->
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <img
                src="https://kurselrfgbnyhnmrlltq.supabase.co/storage/v1/object/public/public-assets/nous-logo.png"
                alt="NÖUS Finance"
                width="72"
                style="display:block;border:0;outline:none;"
              />
            </td>
          </tr>

          <!-- TÍTULO -->
          <tr>
            <td style="
              font-family:-apple-system, BlinkMacSystemFont, Arial, sans-serif;
              font-size:20px;
              font-weight:500;
              color:#FFFFFF;
              padding-bottom:24px;
            ">
              Bem-vindo(a) à NÖUS.
            </td>
          </tr>

          <!-- TEXTO -->
          <tr>
            <td style="font-family:-apple-system, BlinkMacSystemFont, Arial, sans-serif;font-size:15px;line-height:1.6;color:#E5E7EB;">
              A <strong>NÖUS Finance</strong> é uma plataforma de gestão financeira baseada em método,
              desenvolvida para organizar orçamentos, compromissos, metas e ativos
              em um único ambiente.
            </td>
          </tr>

          <tr>
            <td style="font-family:-apple-system, BlinkMacSystemFont, Arial, sans-serif;font-size:15px;line-height:1.6;color:#E5E7EB;padding-top:16px;">
              Nosso objetivo é fornecer a estrutura e os dados necessários para apoiar
              decisões financeiras mais eficientes e consistentes ao longo do tempo.
            </td>
          </tr>

          <tr>
            <td style="font-family:-apple-system, BlinkMacSystemFont, Arial, sans-serif;font-size:15px;line-height:1.6;color:#E5E7EB;padding-top:16px;">
              Sua conta agora está ativa e pronta para uso.
            </td>
          </tr>

          <!-- ASSINATURA -->
          <tr>
            <td style="padding-top:40px;font-family:-apple-system, BlinkMacSystemFont, Arial, sans-serif;font-size:14px;color:#D1D5DB;">
              Atenciosamente,<br/>
              <strong>NÖUS Finance</strong>
            </td>
          </tr>

          <!-- DIVISOR -->
          <tr>
            <td style="padding-top:40px;border-top:1px solid #1F2937;"></td>
          </tr>

          <!-- SOCIAL -->
          <tr>
            <td style="padding-top:24px;font-family:-apple-system, BlinkMacSystemFont, Arial, sans-serif;font-size:12px;color:#9CA3AF;">
              Conecte-se com a NÖUS
            </td>
          </tr>

          <tr>
            <td style="padding-top:8px;">
              <a href="https://www.linkedin.com/company/n%C3%B6us-finance/about/" style="color:#FFFFFF;margin-right:12px;text-decoration:none;">LinkedIn</a>
              <a href="https://instagram.com/nous.app" style="color:#FFFFFF;margin-right:12px;text-decoration:none;">Instagram</a>
              <a href="https://tiktok.com/@nous.app" style="color:#FFFFFF;text-decoration:none;">TikTok</a>
            </td>
          </tr>

          <!-- STORES -->
          <tr>
            <td style="padding-top:24px;">
              <span style="font-family:-apple-system, BlinkMacSystemFont, Arial, sans-serif;font-size:13px;color:#FFFFFF;margin-right:16px;">
                 App Store
              </span>
              <img
                src="https://kurselrfgbnyhnmrlltq.supabase.co/storage/v1/object/public/public-assets/playstore.png"
                alt="Google Play"
                width="72"
                style="display:inline-block;border:0;outline:none;"
              />
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding-top:32px;font-family:-apple-system, BlinkMacSystemFont, Arial, sans-serif;font-size:11px;color:#6B7280;">
              © ${new Date().getFullYear()} NÖUS Finance. Todos os direitos reservados.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "NÖUS Finance <onboarding@resend.dev>",
        to: [email],
        subject: "Bem-vindo à NÖUS Finance",
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend error:", error);
      return new Response("Failed to send email", { status: 500 });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
});

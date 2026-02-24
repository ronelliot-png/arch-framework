bash

cat /home/claude/arch-framework/api/send-email.js
Output

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { name, email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VertiCliff <noreply@updates.zygnl.io>",
        to: [email],
        subject: "Welcome to VertiCliff — Your framework is ready",
        html: `
          <div style="font-family:'Georgia',serif;background:#06080f;color:#e2ddd4;padding:48px 32px;max-width:560px;margin:0 auto;border-radius:8px;">
            <div style="width:3px;height:32px;background:linear-gradient(180deg,#6366f1,#ec4899,#ffd700);border-radius:2px;margin-bottom:24px;"></div>
            <div style="font-size:10px;color:#6366f1;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:16px;">VERTICLIFF</div>
            <h1 style="font-size:28px;font-weight:700;color:#ffffff;line-height:1.2;margin:0 0 20px;">
              Your framework<br/>is ready, ${name || "Writer"}.
            </h1>
            <p style="font-size:15px;color:#9ca3af;line-height:1.75;margin-bottom:24px;">
              You now have access to the full ARCH framework — 22 universal story beats, 8 genre-specific beats, and a series arc graph built specifically for vertical series writers.
            </p>
            <p style="font-size:15px;color:#9ca3af;line-height:1.75;margin-bottom:32px;">
              Start with your premise. Pick your genre. The framework handles the architecture. You handle the story.
            </p>
            <a href="https://arch-framework-tau.vercel.app/" style="display:inline-block;background:#6366f1;color:#ffffff;padding:14px 28px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;letter-spacing:0.05em;">
              Open VertiCliff →
            </a>
            <div style="margin-top:48px;padding-top:24px;border-top:1px solid #12172a;">
              <p style="font-size:12px;color:#374151;margin:0;">
                VertiCliff · Engineered for the Hook<br/>
                <a href="mailto:ronelliot@zygnl.io" style="color:#374151;">ronelliot@zygnl.io</a>
              </p>
            </div>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend error:", data);
      return res.status(500).json({ error: data });
    }

    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}

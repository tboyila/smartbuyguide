// api/tiktok/exchange-code.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code, redirect_uri } = req.body || {};

    if (!code || !redirect_uri) {
      return res.status(400).json({ error: "Missing code or redirect_uri" });
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    if (!clientKey || !clientSecret) {
      return res.status(500).json({ error: "TikTok client credentials not configured" });
    }

    const tokenUrl = "https://open.tiktokapis.com/v2/oauth/token/";

    const params = new URLSearchParams();
    params.set("client_key", clientKey);
    params.set("client_secret", clientSecret);
    params.set("code", code);
    params.set("grant_type", "authorization_code");
    params.set("redirect_uri", redirect_uri);

    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("TikTok token error:", data);
      return res.status(400).json({ error: "Failed to exchange code", details: data });
    }

    // TODO: store access_token and open_id in your DB per user.
    // For demo, we just return minimal info to the frontend.
    return res.status(200).json({
      access_token: data.access_token,
      open_id: data.open_id,
      expires_in: data.expires_in,
      user: {
        // you can later call user.info.basic for real profile info
        display_name: data.open_id
      }
    });
  } catch (err) {
    console.error("Exchange-code handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

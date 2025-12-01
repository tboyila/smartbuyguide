// api/tiktok/post.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { productName, mediaUrl, caption, postMode } = req.body || {};

    if (!productName || !mediaUrl || !caption) {
      return res.status(400).json({ error: "Missing productName, mediaUrl, or caption" });
    }

    // In a real app, you look up the logged-in user's TikTok access token.
    // For demo purposes, you might temporarily use a single sandbox token.
    const accessToken = process.env.TIKTOK_DEMO_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(500).json({
        error: "TikTok demo access token not configured (TIKTOK_DEMO_ACCESS_TOKEN)"
      });
    }

    const payload = {
      post_info: {
        title: productName,
        description: caption,
        privacy_level: "PUBLIC_TO_EVERYONE",
        auto_add_music: true
      },
      source_info: {
        source: "PULL_FROM_URL",
        photo_images: [mediaUrl]
      },
      post_mode: postMode === "DIRECT_POST" ? "DIRECT_POST" : "INBOX_DRAFT",
      media_type: "PHOTO"
    };

    const tiktokRes = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/content/init/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await tiktokRes.json();

    if (!tiktokRes.ok) {
      console.error("TikTok post error:", data);
      return res.status(400).json({ error: "Failed to publish content", details: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Post handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// pages/api/proxy/[...path].js
import { getToken } from "next-auth/jwt";

const API_BASE_URL = "https://stage.digibima.com/api";

export default async function handler(req, res) {
  const { path = [] } = req.query;
  const targetUrl = `${API_BASE_URL}/${path.join("/")}`;

  // Get token from session
  const token = await getToken({ req });

  const headers = {
    "Content-Type": "application/json",
  };

  if (token?.token) {
    headers["Authorization"] = `${token.token}`;
  }

  try {
    const options = {
      method: req.method,
      headers,
    };

    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      options.body = JSON.stringify(req.body);
    }

    const apiRes = await fetch(targetUrl, options);
    const contentType = apiRes.headers.get("content-type") || "";

    let responseBody;

    try {
      // Try parsing JSON first
      responseBody = await apiRes.json();
    } catch (jsonError) {
      // If parsing fails, fallback to plain text
      const fallbackText = await apiRes.text();
      responseBody = { message: fallbackText };
    }

    res.status(apiRes.status).json(responseBody);
  } catch (error) {
    console.error(" Proxy error:", error);
    res.status(500).json({ error: "Proxy request failed" });
  }
}

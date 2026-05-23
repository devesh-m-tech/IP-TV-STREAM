const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./models/db"); // MongoDB connection helper

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const channelRoutes = require("./routes/channel");
const planRoutes = require("./routes/plan");
const revenueRoutes = require("./routes/revenue");
const adRoutes = require("./routes/ad");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded channel logos (images)
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// ✅ Serve static streams from the streams/ directory at root and src level with CORS
app.use("/streams", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  next();
}, express.static(path.join(__dirname, "..", "streams")), express.static(path.join(__dirname, "streams")));

// ✅ Redirect misrouted HLS player requests from /api to /streams
app.get("/api/:filename", (req, res, next) => {
  const filename = req.params.filename;
  if (filename.endsWith(".m3u8") || filename.endsWith(".ts")) {
    return res.redirect(`/streams/${filename}`);
  }
  next();
});

// Root route for testing
app.get("/", (req, res) => {
  res.send("✅ IPTV Backend is running");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // only if admin routes exist

// ✅ CHANNEL CRUD API
app.use("/api/channels", channelRoutes);

// ✅ PLANS & REVENUE API
app.use("/api/plans", planRoutes);
app.use("/api/revenue", revenueRoutes);

// ✅ AD BANNERS API
app.use("/api/ads", adRoutes);

// ✅ HIGH-AVAILABILITY CORS-BYPASSING HLS & TS STREAM PROXY
app.get("/api/stream-proxy", async (req, res) => {
  const streamUrl = req.query.url;
  if (!streamUrl) {
    return res.status(400).send("url query parameter is required");
  }

  try {
    const isM3u8 = streamUrl.toLowerCase().split('?')[0].endsWith(".m3u8") || streamUrl.toLowerCase().includes(".m3u8");
    
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };
    
    try {
      const parsedUrl = new URL(streamUrl);
      headers["Origin"] = parsedUrl.origin;
      headers["Referer"] = parsedUrl.origin + "/";
    } catch (e) {
      // ignore parsing error
    }

    const response = await fetch(streamUrl, {
      method: "GET",
      headers: headers
    });

    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch stream: ${response.statusText}`);
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");

    // Reassure full real-time backend connectivity by completely disabling browser and proxy caching
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    if (isM3u8) {
      const playlistText = await response.text();
      const baseUrl = streamUrl.substring(0, streamUrl.lastIndexOf("/") + 1);
      
      let domainUrl = "";
      try {
        domainUrl = new URL(streamUrl).origin;
      } catch (e) {}

      // Resolve current hosting domain dynamically (localhost:4000 or production Render domain)
      const host = req.headers.host || "localhost:4000";
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";

      const lines = playlistText.split("\n");
      const rewrittenLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
          return line;
        }

        let absoluteUrl = "";
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
          absoluteUrl = trimmed;
        } else if (trimmed.startsWith("/")) {
          absoluteUrl = domainUrl + trimmed;
        } else {
          absoluteUrl = baseUrl + trimmed;
        }

        // Return rewritten path to route dynamically through current active host proxy
        return `${protocol}://${host}/api/stream-proxy?url=${encodeURIComponent(absoluteUrl)}`;
      });

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.send(rewrittenLines.join("\n"));
    } else {
      // It's a segment (.ts) or other video chunk, pipe the body stream
      res.setHeader("Content-Type", response.headers.get("content-type") || "video/MP2T");
      
      const body = response.body;
      if (body) {
        const reader = body.getReader();
        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            return;
          }
          res.write(Buffer.from(value));
          await pump();
        };
        await pump();
      } else {
        res.end();
      }
    }
  } catch (err) {
    console.error("Proxy error fetching:", streamUrl, err.message);
    if (!res.headersSent) {
      res.status(500).send("Error streaming resource: " + err.message);
    }
  }
});


// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Internal server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

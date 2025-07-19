const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve the landing page
  if (req.url === "/" || req.url === "/index.html") {
    fs.readFile(path.join(__dirname, "landing.html"), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading landing page");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Landing page server running at http://localhost:${PORT}`);
  console.log(`📱 ReceiptRadar landing page is now live!`);
  console.log(`\n✨ Features:`);
  console.log(
    `   • Clean, minimalist design inspired by Jony Ive & Dieter Rams`
  );
  console.log(`   • Responsive layout for all devices`);
  console.log(`   • Smooth scroll animations`);
  console.log(`   • Accessibility focused`);
  console.log(`\n🔗 Open your browser and visit: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down server...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

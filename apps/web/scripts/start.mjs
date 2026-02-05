import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const distPath = path.join(__dirname, "../dist");

app.use(express.static(distPath));

// Express v5 (path-to-regexp v6+) does not accept "*" as a string route.
app.get(/.*/, (_, res) =>
  res.sendFile(path.join(distPath, "index.html"))
);

// Railway injects PORT; fall back to 8080 for local runs (matches Dockerfile convention)
const port = process.env.PORT || 8080;

app.listen(port, "0.0.0.0", () => {
  console.log("Server running on port", port);
});

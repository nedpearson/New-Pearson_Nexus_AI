import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const distPath = path.join(__dirname, "../dist");

app.use(express.static(distPath));

app.get("*", (_, res) =>
  res.sendFile(path.join(distPath, "index.html"))
);

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log("Server running on port", port);
});

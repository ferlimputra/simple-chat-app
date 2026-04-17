import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { createApp } from "./app";
import { OllamaChatService } from "./services/ollamaChatService";
import { OllamaClient } from "./services/ollamaClient";

dotenv.config();

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
if (Number.isNaN(port) || port <= 0) {
  throw new Error("Invalid PORT configuration");
}

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
const ollamaModel = process.env.OLLAMA_MODEL ?? "";
const staticDir = path.resolve(
  process.env.STATIC_DIR ?? path.join(process.cwd(), "public"),
);
const isProduction = process.env.NODE_ENV === "production";

if (!ollamaModel) {
  console.warn(
    "Warning: OLLAMA_MODEL is not set. Requests will fail until you configure it.",
  );
}

const staticAppJsPath = path.join(staticDir, "app.js");
if (!fs.existsSync(staticAppJsPath)) {
  console.warn(
    `Warning: ${staticAppJsPath} does not exist. Run "npm run dev" or "npm run build" first.`,
  );
}

const ollamaClient = new OllamaClient({
  baseUrl: ollamaBaseUrl,
  timeoutMs: 120_000,
});

const chatService = new OllamaChatService({
  defaultModel: ollamaModel,
  ollamaClient,
});

const app = createApp({
  chatService,
  staticDir,
  isProduction,
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { createApp } from "./app";
import { OllamaClient } from "./services/ollamaClient";
import { OllamaChatService } from "./services/ollamaChatService";

dotenv.config();

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
if (Number.isNaN(port) || port <= 0) {
  throw new Error("Invalid PORT configuration");
}

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
const ollamaModel = process.env.OLLAMA_MODEL ?? "";
const staticDir = process.env.STATIC_DIR ?? path.resolve(process.cwd(), "public");

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
  timeoutMs: 60_000,
});

const chatService = new OllamaChatService({
  defaultModel: ollamaModel,
  ollamaClient,
});

const app = createApp({
  chatService,
  staticDir,
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});


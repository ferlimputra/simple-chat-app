import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { healthRouter } from "./routes/health";
import { createChatRouter } from "./routes/chat";
import type { ChatService } from "./services/chatService";
import { errorHandler } from "./middlewares/errorHandler";

export type CreateAppOptions = {
  chatService: ChatService;
  staticDir?: string;
};

export function createApp(options: CreateAppOptions) {
  const app = express();

  const staticDir =
    options.staticDir ?? process.env.STATIC_DIR ?? path.resolve(process.cwd(), "public");

  app.use(helmet());
  app.use(
    express.json({
      limit: "32kb",
    }),
  );

  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(express.static(staticDir, { maxAge: "1h" }));

  app.use("/api", healthRouter);
  app.use("/api", createChatRouter(options.chatService));

  app.get("/", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });

  // Frontend route fallback for any unknown GET URL.
  // (Express 5 does not accept the old `app.get("*")` wildcard pattern.)
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api")) return next();
    return res.sendFile(path.join(staticDir, "index.html"));
  });

  app.use(errorHandler);

  return app;
}


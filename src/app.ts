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
  isProduction?: boolean;
};

export function createApp(options: CreateAppOptions) {
  const app = express();
  const isProduction = options.isProduction ?? process.env.NODE_ENV === "production";

  const staticDirInput =
    options.staticDir ?? process.env.STATIC_DIR ?? path.join(process.cwd(), "public");
  const staticDir = path.resolve(staticDirInput);

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

  app.use(
    express.static(staticDir, {
      maxAge: isProduction ? "1h" : 0,
      etag: true,
      lastModified: true,
      setHeaders: (res) => {
        if (!isProduction) {
          res.setHeader("Cache-Control", "no-store");
        }
      },
    }),
  );

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


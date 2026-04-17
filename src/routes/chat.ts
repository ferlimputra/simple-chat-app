import { Router } from "express";
import type { ChatService, ChatRequest } from "../services/chatService";
import { chatRequestSchema } from "./chatSchema";

export function createChatRouter(chatService: ChatService) {
  const router = Router();

  router.post("/chat", async (req, res, next) => {
    try {
      const parsed = chatRequestSchema.parse(req.body);

      const chatRequest: ChatRequest = {
        model: parsed.model,
        messages: parsed.messages,
        stream: parsed.stream ?? false,
      };

      if (chatRequest.stream) {
        res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        for await (const token of chatService.streamChat(chatRequest)) {
          res.write(`${JSON.stringify({ token })}\n`);
        }

        res.write(`${JSON.stringify({ done: true })}\n`);
        return res.end();
      }

      const { assistantMessage } = await chatService.chat(chatRequest);
      return res.status(200).json({ assistantMessage });
    } catch (err) {
      if (res.headersSent) {
        const message = err instanceof Error ? err.message : "streaming_failed";
        res.write(`${JSON.stringify({ error: message, done: true })}\n`);
        return res.end();
      }
      return next(err);
    }
  });

  return router;
}


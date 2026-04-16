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

      const { assistantMessage } = await chatService.chat(chatRequest);
      return res.status(200).json({ assistantMessage });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}


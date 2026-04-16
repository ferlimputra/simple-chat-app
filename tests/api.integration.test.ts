import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import type { ChatService } from "../src/services/chatService";
import { HttpError } from "../src/lib/httpErrors";

describe("API integration", () => {
  it("GET /api/health returns ok", async () => {
    const chatService: ChatService = {
      chat: vi.fn(),
    };

    const app = createApp({
      chatService,
      staticDir: path.resolve(process.cwd(), "public"),
    });

    await request(app).get("/api/health").expect(200).expect({ status: "ok" });
  });

  it("POST /api/chat returns assistantMessage", async () => {
    const chatService: ChatService = {
      chat: vi.fn().mockResolvedValue({ assistantMessage: "Hi there" }),
    };

    const app = createApp({
      chatService,
      staticDir: path.resolve(process.cwd(), "public"),
    });

    const res = await request(app)
      .post("/api/chat")
      .send({ messages: [{ role: "user", content: "Hello" }] })
      .expect(200);

    expect(res.body).toEqual({ assistantMessage: "Hi there" });
    expect(chatService.chat).toHaveBeenCalledTimes(1);
  });

  it("POST /api/chat validates request body", async () => {
    const chatService: ChatService = {
      chat: vi.fn(),
    };

    const app = createApp({
      chatService,
      staticDir: path.resolve(process.cwd(), "public"),
    });

    await request(app)
      .post("/api/chat")
      .send({ messages: [] })
      .expect(400);
  });

  it("POST /api/chat maps HttpError to a safe response", async () => {
    const chatService: ChatService = {
      chat: vi.fn().mockRejectedValue(new HttpError(400, "streaming_not_supported")),
    };

    const app = createApp({
      chatService,
      staticDir: path.resolve(process.cwd(), "public"),
    });

    const res = await request(app)
      .post("/api/chat")
      .send({ messages: [{ role: "user", content: "Hello" }], stream: true })
      .expect(400);

    expect(res.body).toMatchObject({
      error: "bad_request",
      message: "streaming_not_supported",
    });
  });
});


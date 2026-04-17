import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import type { ChatService } from "../src/services/chatService";
import { HttpError } from "../src/lib/httpErrors";

function createMockChatService(overrides?: Partial<ChatService>): ChatService {
  return {
    chat: vi.fn().mockResolvedValue({ assistantMessage: "default" }),
    streamChat: vi.fn().mockImplementation(async function* () {
      yield "default";
    }),
    ...overrides,
  };
}

describe("API integration", () => {
  it("GET /api/health returns ok", async () => {
    const chatService = createMockChatService();

    const app = createApp({
      chatService,
      staticDir: path.resolve(process.cwd(), "public"),
    });

    await request(app).get("/api/health").expect(200).expect({ status: "ok" });
  });

  it("POST /api/chat returns assistantMessage", async () => {
    const chatService = createMockChatService({
      chat: vi.fn().mockResolvedValue({ assistantMessage: "Hi there" }),
    });

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
    const chatService = createMockChatService();

    const app = createApp({
      chatService,
      staticDir: path.resolve(process.cwd(), "public"),
    });

    await request(app)
      .post("/api/chat")
      .send({ messages: [] })
      .expect(400);
  });

  it("POST /api/chat streams ndjson tokens", async () => {
    const chatService = createMockChatService({
      streamChat: vi.fn().mockImplementation(async function* () {
        yield "Hi";
        yield " there";
      }),
    });

    const app = createApp({
      chatService,
      staticDir: path.resolve(process.cwd(), "public"),
    });

    const res = await request(app)
      .post("/api/chat")
      .send({ messages: [{ role: "user", content: "Hello" }], stream: true })
      .expect(200);

    expect(res.headers["content-type"]).toContain("application/x-ndjson");
    expect(res.text).toContain(`{"token":"Hi"}`);
    expect(res.text).toContain(`{"token":" there"}`);
    expect(res.text).toContain(`{"done":true}`);
  });

  it("POST /api/chat stream failure sends terminal ndjson error", async () => {
    const chatService = createMockChatService({
      streamChat: vi
        .fn()
        .mockImplementation(async function* () {
          throw new HttpError(502, "ollama_unreachable_or_timed_out");
        }),
    });

    const app = createApp({
      chatService,
      staticDir: path.resolve(process.cwd(), "public"),
    });

    const res = await request(app)
      .post("/api/chat")
      .send({ messages: [{ role: "user", content: "Hello" }], stream: true })
      .expect(200);

    expect(res.text).toContain(`"error":"ollama_unreachable_or_timed_out"`);
    expect(res.text).toContain(`"done":true`);
  });
});


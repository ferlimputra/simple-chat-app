import { describe, expect, it, vi } from "vitest";
import { OllamaClient } from "../src/services/ollamaClient";

describe("OllamaClient", () => {
  it("returns assistant content on success", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        message: { role: "assistant", content: "Hello from Ollama" },
      }),
    });

    const client = new OllamaClient({
      baseUrl: "http://example.test",
      timeoutMs: 1000,
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    const content = await client.chat({
      model: "llama3",
      messages: [{ role: "user", content: "Hi" }],
    });

    expect(content).toBe("Hello from Ollama");
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("throws HttpError(502) on upstream failure", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "upstream error",
    });

    const client = new OllamaClient({
      baseUrl: "http://example.test",
      timeoutMs: 1000,
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    await expect(
      client.chat({
        model: "llama3",
        messages: [{ role: "user", content: "Hi" }],
      }),
    ).rejects.toMatchObject({ statusCode: 502 });
  });

  it("streams chunks from ndjson response", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('{"message":{"role":"assistant","content":"Hi"}}\n'));
        controller.enqueue(encoder.encode('{"message":{"role":"assistant","content":" there"}}\n'));
        controller.close();
      },
    });

    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: stream,
    });

    const client = new OllamaClient({
      baseUrl: "http://example.test",
      timeoutMs: 1000,
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    const chunks: string[] = [];
    for await (const chunk of client.streamChat({
      model: "llama3",
      messages: [{ role: "user", content: "Hi" }],
    })) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(["Hi", " there"]);
  });
});


import { HttpError } from "../lib/httpErrors";
import type { ChatMessage, ChatRole } from "./chatService";

export type OllamaChatResponse = {
  message?: {
    role: ChatRole | string;
    content: string;
  };
  done?: boolean;
  [key: string]: unknown;
};

export type OllamaClientOptions = {
  baseUrl: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
};

export class OllamaClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(options: OllamaClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs ?? 60_000;
    this.fetchFn = options.fetchFn ?? globalThis.fetch.bind(globalThis);
  }

  async chat(params: { model: string; messages: ChatMessage[] }): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await this.fetchFn(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: params.model,
          messages: params.messages,
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => "");
        throw new HttpError(
          502,
          "ollama_request_failed",
          bodyText ? { bodyText } : null,
        );
      }

      const json = (await res.json()) as OllamaChatResponse;
      const content = json.message?.content;
      if (!content) {
        throw new HttpError(502, "ollama_bad_response");
      }
      return content;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(502, "ollama_unreachable_or_timed_out");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async *streamChat(params: { model: string; messages: ChatMessage[] }): AsyncGenerator<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await this.fetchFn(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: params.model,
          messages: params.messages,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => "");
        throw new HttpError(
          502,
          "ollama_request_failed",
          bodyText ? { bodyText } : null,
        );
      }

      if (!res.body) {
        throw new HttpError(502, "ollama_bad_response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const json = JSON.parse(trimmed) as OllamaChatResponse;
          const content = json.message?.content;
          if (typeof content === "string" && content.length > 0) {
            yield content;
          }
        }
      }

      const tail = buffer.trim();
      if (tail) {
        const json = JSON.parse(tail) as OllamaChatResponse;
        const content = json.message?.content;
        if (typeof content === "string" && content.length > 0) {
          yield content;
        }
      }
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(502, "ollama_unreachable_or_timed_out");
    } finally {
      clearTimeout(timeoutId);
    }
  }
}


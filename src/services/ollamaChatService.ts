import type { ChatRequest, ChatResponse, ChatService } from "./chatService";
import { OllamaClient } from "./ollamaClient";
import { HttpError } from "../lib/httpErrors";

export type OllamaChatServiceOptions = {
  defaultModel: string;
  ollamaClient: OllamaClient;
};

export class OllamaChatService implements ChatService {
  private readonly defaultModel: string;
  private readonly ollamaClient: OllamaClient;

  constructor(options: OllamaChatServiceOptions) {
    this.defaultModel = options.defaultModel;
    this.ollamaClient = options.ollamaClient;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (request.stream) {
      // This initial feature is non-streaming. Streaming can be added later
      // by introducing a stream-capable service + frontend SSE updates.
      throw new HttpError(400, "streaming_not_supported");
    }

    const model = request.model ?? this.defaultModel;
    if (!model) {
      throw new HttpError(400, "missing_model");
    }

    const assistantMessage = await this.ollamaClient.chat({
      model,
      messages: request.messages,
    });

    return { assistantMessage };
  }
}


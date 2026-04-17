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
    const model = this.resolveModel(request.model);

    const assistantMessage = await this.ollamaClient.chat({
      model,
      messages: request.messages,
    });

    return { assistantMessage };
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<string, void, void> {
    const model = this.resolveModel(request.model);

    for await (const token of this.ollamaClient.streamChat({
      model,
      messages: request.messages,
    })) {
      yield token;
    }
  }

  private resolveModel(requestModel?: string) {
    const model = requestModel ?? this.defaultModel;
    if (!model) {
      throw new HttpError(400, "missing_model");
    }
    return model;
  }
}


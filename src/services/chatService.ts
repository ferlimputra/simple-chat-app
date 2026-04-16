export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequest = {
  model?: string;
  messages: ChatMessage[];
  stream?: boolean;
};

export type ChatResponse = {
  assistantMessage: string;
};

export interface ChatService {
  chat(request: ChatRequest): Promise<ChatResponse>;
}


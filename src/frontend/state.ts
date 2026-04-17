import { maxContextMessages } from "./config.ts";
import { ChatMessage } from "./types.ts";

export const messages: ChatMessage[] = [];

export function getRequestMessages(
  nextUserMessage: ChatMessage,
): ChatMessage[] {
  return [...messages, nextUserMessage]
    .filter((message) => message.content.trim().length > 0)
    .slice(-maxContextMessages);
}

export function addMessage(message: ChatMessage): void {
  messages.push(message);
}

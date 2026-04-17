import { ChatMessage } from "../types.ts";
import { readNdjsonStream } from "../utils/stream.ts";

async function createStreamResponse(requestMessages: ChatMessage[]) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: requestMessages,
      stream: true,
    }),
    credentials: "same-origin",
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => null)) as {
      error?: string;
      message?: string;
    } | null;
    const message =
      errBody?.message ?? errBody?.error ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (!res.body) {
    throw new Error("No response body");
  }

  return res;
}

export async function streamAssistantReply(
  requestMessages: ChatMessage[],
  assistantMessage: ChatMessage,
  onToken: (token: string) => void,
): Promise<void> {
  const res = await createStreamResponse(requestMessages);

  for await (const payload of readNdjsonStream(
    res.body as ReadableStream<Uint8Array>,
  )) {
    if (payload.error) {
      throw new Error(payload.error);
    }

    if (typeof payload.token === "string") {
      assistantMessage.content += payload.token;
      onToken(payload.token);
    }
  }
}

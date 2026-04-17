import { StreamPayload } from "../api/types.ts";

export async function* readNdjsonStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<StreamPayload> {
  const reader = body.getReader();
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
      yield JSON.parse(trimmed) as StreamPayload;
    }
  }

  const tail = buffer.trim();
  if (tail) {
    yield JSON.parse(tail) as StreamPayload;
  }
}

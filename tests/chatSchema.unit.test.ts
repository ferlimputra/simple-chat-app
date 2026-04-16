import { describe, expect, it } from "vitest";
import { chatRequestSchema } from "../src/routes/chatSchema";

describe("chatRequestSchema", () => {
  it("parses a valid request", () => {
    const parsed = chatRequestSchema.parse({
      model: "llama3",
      messages: [{ role: "user", content: "Hello" }],
    });

    expect(parsed.messages).toHaveLength(1);
    expect(parsed.messages[0].role).toBe("user");
  });

  it("rejects empty messages", () => {
    const result = chatRequestSchema.safeParse({
      messages: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "system", content: "Nope" }],
    });
    expect(result.success).toBe(false);
  });
});


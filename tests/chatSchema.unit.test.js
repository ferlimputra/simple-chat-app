"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const chatSchema_1 = require("../src/routes/chatSchema");
(0, vitest_1.describe)("chatRequestSchema", () => {
    (0, vitest_1.it)("parses a valid request", () => {
        const parsed = chatSchema_1.chatRequestSchema.parse({
            model: "llama3",
            messages: [{ role: "user", content: "Hello" }],
        });
        (0, vitest_1.expect)(parsed.messages).toHaveLength(1);
        (0, vitest_1.expect)(parsed.messages[0].role).toBe("user");
    });
    (0, vitest_1.it)("rejects empty messages", () => {
        const result = chatSchema_1.chatRequestSchema.safeParse({
            messages: [],
        });
        (0, vitest_1.expect)(result.success).toBe(false);
    });
    (0, vitest_1.it)("rejects invalid role", () => {
        const result = chatSchema_1.chatRequestSchema.safeParse({
            messages: [{ role: "system", content: "Nope" }],
        });
        (0, vitest_1.expect)(result.success).toBe(false);
    });
});

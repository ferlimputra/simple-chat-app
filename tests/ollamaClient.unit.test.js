"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const ollamaClient_1 = require("../src/services/ollamaClient");
(0, vitest_1.describe)("OllamaClient", () => {
    (0, vitest_1.it)("returns assistant content on success", async () => {
        const fetchFn = vitest_1.vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                message: { role: "assistant", content: "Hello from Ollama" },
            }),
        });
        const client = new ollamaClient_1.OllamaClient({
            baseUrl: "http://example.test",
            timeoutMs: 1000,
            fetchFn: fetchFn,
        });
        const content = await client.chat({
            model: "llama3",
            messages: [{ role: "user", content: "Hi" }],
        });
        (0, vitest_1.expect)(content).toBe("Hello from Ollama");
        (0, vitest_1.expect)(fetchFn).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)("throws HttpError(502) on upstream failure", async () => {
        const fetchFn = vitest_1.vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            text: async () => "upstream error",
        });
        const client = new ollamaClient_1.OllamaClient({
            baseUrl: "http://example.test",
            timeoutMs: 1000,
            fetchFn: fetchFn,
        });
        await (0, vitest_1.expect)(client.chat({
            model: "llama3",
            messages: [{ role: "user", content: "Hi" }],
        })).rejects.toMatchObject({ statusCode: 502 });
    });
});

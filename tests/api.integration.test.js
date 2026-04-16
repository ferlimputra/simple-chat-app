"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const httpErrors_1 = require("../src/lib/httpErrors");
(0, vitest_1.describe)("API integration", () => {
    (0, vitest_1.it)("GET /api/health returns ok", async () => {
        const chatService = {
            chat: vitest_1.vi.fn(),
        };
        const app = (0, app_1.createApp)({
            chatService,
            staticDir: node_path_1.default.resolve(process.cwd(), "public"),
        });
        await (0, supertest_1.default)(app).get("/api/health").expect(200).expect({ status: "ok" });
    });
    (0, vitest_1.it)("POST /api/chat returns assistantMessage", async () => {
        const chatService = {
            chat: vitest_1.vi.fn().mockResolvedValue({ assistantMessage: "Hi there" }),
        };
        const app = (0, app_1.createApp)({
            chatService,
            staticDir: node_path_1.default.resolve(process.cwd(), "public"),
        });
        const res = await (0, supertest_1.default)(app)
            .post("/api/chat")
            .send({ messages: [{ role: "user", content: "Hello" }] })
            .expect(200);
        (0, vitest_1.expect)(res.body).toEqual({ assistantMessage: "Hi there" });
        (0, vitest_1.expect)(chatService.chat).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)("POST /api/chat validates request body", async () => {
        const chatService = {
            chat: vitest_1.vi.fn(),
        };
        const app = (0, app_1.createApp)({
            chatService,
            staticDir: node_path_1.default.resolve(process.cwd(), "public"),
        });
        await (0, supertest_1.default)(app)
            .post("/api/chat")
            .send({ messages: [] })
            .expect(400);
    });
    (0, vitest_1.it)("POST /api/chat maps HttpError to a safe response", async () => {
        const chatService = {
            chat: vitest_1.vi.fn().mockRejectedValue(new httpErrors_1.HttpError(400, "streaming_not_supported")),
        };
        const app = (0, app_1.createApp)({
            chatService,
            staticDir: node_path_1.default.resolve(process.cwd(), "public"),
        });
        const res = await (0, supertest_1.default)(app)
            .post("/api/chat")
            .send({ messages: [{ role: "user", content: "Hello" }], stream: true })
            .expect(400);
        (0, vitest_1.expect)(res.body).toMatchObject({
            error: "bad_request",
            message: "streaming_not_supported",
        });
    });
});

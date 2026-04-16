import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z
    .string()
    .min(1, "content_required")
    .max(8000, "content_too_long"),
});

export const chatRequestSchema = z.object({
  model: z
    .string()
    .min(1, "model_required")
    .max(64, "model_too_long")
    .optional(),
  messages: z
    .array(chatMessageSchema)
    .min(1, "messages_required")
    .max(20, "messages_too_many"),
  stream: z.boolean().optional(),
});

export type ChatRequestSchema = z.infer<typeof chatRequestSchema>;


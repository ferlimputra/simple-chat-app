import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { HttpError } from "../lib/httpErrors";

export function errorHandler(err: unknown, _req: Request, res: Response): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "invalid_request",
      details: z.treeifyError(err),
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: "bad_request",
      message: err.message,
      details: err.details ?? null,
    });
    return;
  }

  // Avoid leaking internal details to clients.
  console.error(err);
  res.status(500).json({
    error: "internal_error",
  });
}

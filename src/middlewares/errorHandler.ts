import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/httpErrors";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "invalid_request",
      details: err.flatten(),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      error: "bad_request",
      message: err.message,
      details: err.details ?? null,
    });
  }

  // Avoid leaking internal details to clients.
  console.error(err);
  return res.status(500).json({
    error: "internal_error",
  });
}


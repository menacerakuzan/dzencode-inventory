import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError, type ZodType } from 'zod';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const zodDetails = (error: ZodError) =>
  error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));

export function parseOrThrow<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, 'Validation failed', zodDetails(result.error));
  }
  return result.data;
}

export const notFound: RequestHandler = (_req, _res, next) => {
  next(new HttpError(404, 'Not found'));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message, errors: error.details });
    return;
  }
  if (error?.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'Malformed JSON body' });
    return;
  }
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
};

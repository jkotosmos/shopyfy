import type { NextFunction, Request, RequestHandler, Response } from "express";

// Express 4 does not catch rejected promises from async route handlers —
// an unhandled rejection there just hangs the request forever instead of
// returning an error. Wrapping every async handler in this forwards the
// error to Express's error middleware so callers always get a response.
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

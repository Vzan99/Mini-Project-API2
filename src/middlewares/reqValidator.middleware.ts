import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";

/**
 * Middleware to validate request bodies against a Zod schema.
 * Accepts any Zod schema (including effects like transforms/refines).
 */
export default function ReqValidator(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // parse will throw if invalid, and also apply transforms
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          path: e.path,
          message: e.message,
        }));
        res.status(400).json({ message: "Validation failed", details });
      } else {
        next(err);
      }
    }
  };
}

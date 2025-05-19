import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";

export default function QueryValidator(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);
      (req as any).validatedQuery = parsed;
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

import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";

export default function ReqValidator(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          path: e.path,
          message: e.message,
        }));
        console.error("Zod validation error:", details);
        res.status(400).json({ message: "Validation failed", details });
      } else {
        next(err);
      }
    }
  };
}

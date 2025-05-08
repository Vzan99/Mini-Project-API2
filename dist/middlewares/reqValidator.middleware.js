"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReqValidator;
const zod_1 = require("zod");
/**
 * Middleware to validate request bodies against a Zod schema.
 * Accepts any Zod schema (including effects like transforms/refines).
 */
function ReqValidator(schema) {
    return (req, res, next) => {
        try {
            // parse will throw if invalid, and also apply transforms
            req.body = schema.parse(req.body);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const details = err.errors.map((e) => ({
                    path: e.path,
                    message: e.message,
                }));
                res.status(400).json({ message: "Validation failed", details });
            }
            else {
                next(err);
            }
        }
    };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReqValidator;
const zod_1 = require("zod");
function ReqValidator(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const details = err.errors.map((e) => ({
                    path: e.path,
                    message: e.message,
                }));
                console.error("Zod validation error:", details);
                res.status(400).json({ message: "Validation failed", details });
            }
            else {
                next(err);
            }
        }
    };
}

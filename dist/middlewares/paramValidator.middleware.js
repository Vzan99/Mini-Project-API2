"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ParamValidator;
const zod_1 = require("zod");
function ParamValidator(schema) {
    return (req, res, next) => {
        try {
            const parsed = schema.parse(req.params);
            req.validatedParams = parsed;
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

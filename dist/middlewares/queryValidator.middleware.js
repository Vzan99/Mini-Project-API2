"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueryValidator;
const zod_1 = require("zod");
function QueryValidator(schema) {
    return (req, res, next) => {
        try {
            const parsed = schema.parse(req.query);
            // Store validated query in a custom property
            req.validatedQuery = parsed;
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

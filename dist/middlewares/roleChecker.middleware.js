"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleChecker = RoleChecker;
function RoleChecker(roles) {
    return (req, res, next) => {
        // Check if user exists in request
        if (!req.user) {
            throw new Error("Unauthorized");
        }
        // Check if user role is in allowed roles
        if (!roles.includes(req.user.role)) {
            throw new Error("Unauthorized");
        }
        next();
    };
}

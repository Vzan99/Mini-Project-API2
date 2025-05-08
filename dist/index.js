"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const cors_1 = __importDefault(require("cors"));
const event_router_1 = __importDefault(require("./routers/event.router"));
const voucher_router_1 = __importDefault(require("./routers/voucher.router"));
const transaction_router_1 = __importDefault(require("./routers/transaction.router"));
const review_router_1 = __importDefault(require("./routers/review.router"));
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const testdata_router_1 = __importDefault(require("./routers/testdata.router"));
const admin_router_1 = __importDefault(require("./routers/admin.router"));
const profileManagement_router_1 = __importDefault(require("./routers/profileManagement.router"));
const expire_transaction_task_1 = require("./utils/cron/expire-transaction-task");
const cancel_transaction_task_1 = require("./utils/cron/cancel-transaction-task");
const port = config_1.PORT || 8000;
const app = (0, express_1.default)();
//Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // Allow both localhost variations
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
//Test Connection
app.get("/ping", (req, res) => {
    res.status(200).send("ping pong");
});
//Auto Expire Transaction
(0, expire_transaction_task_1.AutoExpireTransactionTask)();
//Auto Cancel Transaction
(0, cancel_transaction_task_1.AutoCancelTransactionTask)();
//Events
app.use("/events", event_router_1.default);
//Vouchers
app.use("/vouchers", voucher_router_1.default);
//Transactions
app.use("/transactions", transaction_router_1.default);
//Reviews
app.use("/reviews", review_router_1.default);
//Authentication
app.use("/auth", auth_router_1.default);
//test database
app.use("/testdata", testdata_router_1.default);
//Admin (multiuse for get, filter, etc)
app.use("/admin", admin_router_1.default);
//Profile
app.use("/profile", profileManagement_router_1.default);
//Port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

import express, { Application } from "express";
import { Request, Response, NextFunction } from "express";
import { FE_URL, PORT } from "./config";
import cors from "cors";

import EventRouter from "./routers/event.router";
import VoucherRouter from "./routers/voucher.router";
import TransactionRouter from "./routers/transaction.router";
import ReviewRouter from "./routers/review.router";
import AuthRouter from "./routers/auth.router";
import Test from "./routers/testdata.router";
import AdminRouter from "./routers/admin.router";
import ProfileRouter from "./routers/profileManagement.router";

import { AutoExpireTransactionTask } from "./utils/cron/expire-transaction-task";
import { AutoCancelTransactionTask } from "./utils/cron/cancel-transaction-task";

const port = PORT || 8000;
const app: Application = express();

//Middleware
app.use(express.json());

app.use(
  cors({
    origin: FE_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

//Test Connection
app.get("/ping", (req: Request, res: Response) => {
  res.status(200).send("ping pong");
});

//Auto Expire Transaction
AutoExpireTransactionTask();
//Auto Cancel Transaction
AutoCancelTransactionTask();

//Events
app.use("/events", EventRouter);

//Vouchers
app.use("/vouchers", VoucherRouter);

//Transactions
app.use("/transactions", TransactionRouter);

//Reviews
app.use("/reviews", ReviewRouter);

//Authentication
app.use("/auth", AuthRouter);

//test database
app.use("/testdata", Test);

//Admin (multiuse for get, filter, etc)
app.use("/admin", AdminRouter);

//Profile
app.use("/profile", ProfileRouter);

//Port
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

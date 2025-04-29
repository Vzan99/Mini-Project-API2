import express, { Application } from "express";
import { Request, Response, NextFunction } from "express";
import { PORT } from "./config";

import EventRouter from "./routers/event.router";
import VoucherRouter from "./routers/voucher.router";
import TransactionRouter from "./routers/transaction.router";
import AdminRouter from "./routers/admin.router";

const port = PORT || 8000;
const app: Application = express();

//Middleware
app.use(express.json());

//Test Connection
app.get("/ping", (req: Request, res: Response) => {
  res.status(200).send("ping pong");
});

//Events
app.use("/events", EventRouter);

//Vouchers
app.use("/vouchers", VoucherRouter);

//Transactions
app.use("/transactions", TransactionRouter);
app.use("/admin", AdminRouter);

//Port
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

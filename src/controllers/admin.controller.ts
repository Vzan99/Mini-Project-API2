import { Request, Response, NextFunction } from "express";
import { CancelTransactionService } from "../services/transaction.service";

async function CancelTransactionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const txId = Number(req.params.id);
    await CancelTransactionService(txId);
    res.status(200).json({ message: "Transaction cancelled.", txId });
  } catch (err) {
    next(err);
  }
}

export { CancelTransactionController };

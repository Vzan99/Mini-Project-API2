import { Request, Response, NextFunction } from "express";
import {
  CreateTransactionService,
  ConfirmTransactionService,
} from "../services/transaction.service";

async function CreateTransactionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await CreateTransactionService(req.body);

    res.status(201).send({
      message: "Create Transaction Success!",
      data,
    });
  } catch (err) {
    next(err);
  }
}

// async function ConfirmTransactionController(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   try {
//     const transactionId = Number(req.params.id);
//     if (!req.file) {
//       throw new Error("Payment proof file is required");
//     }

//     // In production you'd store the file somewhere and get its URL
//     const proofUrl = `/uploads/${req.file.filename}`;

//     const updated = await ConfirmTransactionService(transactionId, proofUrl);

//     res.status(200).json({
//       message: "Payment proof received, pending admin confirmation",
//       data: updated,
//     });
//   } catch (err) {
//     next(err);
//   }
// }

export { CreateTransactionController };

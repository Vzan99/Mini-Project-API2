import { Request, Response, NextFunction } from "express";
import {
  CreateTransactionService,
  PaymentTransactionService,
  EOActionTransactionService,
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

//Upload Image dan ConfirmTransaction Service
//Kalau eventnya free apa boleh langsung confirm tanpa approve admin??
async function PaymentTransactionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: transactionId } = req.params;
    // const userId = req.user?.id; // Assuming you're attaching the authenticated user to req.user
    // const { userId } = req.body; // Ngambil dari body dulu, karena belum ada authentication
    const userId = Number(req.body.userId);

    if (!req.file) {
      return next(new Error("Payment proof image is required"));
    }

    if (!userId) {
      return next(new Error("Unauthorized: User ID missing"));
    }

    const updatedTransaction = await PaymentTransactionService({
      transactionId: Number(transactionId),
      userId,
      file: req.file,
    });

    // Send the updated transaction data to the next handler (or to the response)
    res.status(200).json({
      message: "Payment proof submitted successfully",
      data: updatedTransaction,
    });
  } catch (err) {
    // Forward error to the next handler (for centralized error handling)
    next(err);
  }
}

//EO Action Controller (Confirmed or Rejected)
async function EOActionTransactionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { transactionId } = req.params; // Extract transactionId from the URL params
    const { action } = req.body; // Get the action from the request body
    const eoId = Number(req.body.eoId); // Get the userId from the request body

    // Validate if transactionId or action is missing
    if (!transactionId || !action) {
      return next(new Error("Transaction ID and action are required"));
    }

    // Validate if userId is provided
    if (!eoId) {
      return next(new Error("Unauthorized: User ID missing"));
    }

    // Call the service to perform the action (confirm/reject) on the transaction
    const updatedTransaction = await EOActionTransactionService({
      transactionId: Number(transactionId),
      eoId,
      action,
    });

    // Send response with the updated transaction data
    res.status(200).json({
      message: "Transaction status updated successfully",
      data: updatedTransaction,
    });
  } catch (err) {
    // Forward error to the next handler (for centralized error handling)
    next(err);
  }
}

export {
  CreateTransactionController,
  PaymentTransactionController,
  EOActionTransactionController,
};

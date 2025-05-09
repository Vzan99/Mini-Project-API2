import { Request, Response, NextFunction } from "express";
import {
  CreateTransactionService,
  PaymentTransactionService,
  EOActionTransactionService,
  GetUserTicketsService,
} from "../services/transaction.service";

async function CreateTransactionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract userId from JWT token (set by TokenVerification middleware)
    const userId = req.user.id;

    // Add userId to the request body before passing to service
    const transactionData = {
      ...req.body,
      userId,
    };

    const data = await CreateTransactionService(transactionData);

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
    const userId = String(req.body.userId);

    if (!req.file) {
      return next(new Error("Payment proof image is required"));
    }

    if (!userId) {
      return next(new Error("Unauthorized: User ID missing"));
    }

    const updatedTransaction = await PaymentTransactionService({
      transactionId: String(transactionId),
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
    const { transactionId } = req.params;
    const { action } = req.body;

    // Get the user ID from the authenticated user
    const userId = req.user.id;

    // Call the service with the correct parameter name
    const updatedTransaction = await EOActionTransactionService({
      transactionId: String(transactionId),
      userId, // This should match the parameter name in your service
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

async function GetUserTicketsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get the user ID from the authenticated user
    const userId = req.user.id;

    // Call the service to get the user's tickets
    const tickets = await GetUserTicketsService(userId);

    // Send response with the tickets data
    res.status(200).json({
      message: "User tickets retrieved successfully",
      data: tickets,
    });
  } catch (err) {
    next(err);
  }
}

export {
  CreateTransactionController,
  PaymentTransactionController,
  EOActionTransactionController,
  GetUserTicketsController,
};

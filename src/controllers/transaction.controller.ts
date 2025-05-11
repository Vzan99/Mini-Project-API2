import { Request, Response, NextFunction } from "express";
import {
  CreateTransactionService,
  PaymentTransactionService,
  EOActionTransactionService,
  GetUserTicketsService,
  GetTransactionByIdService,
} from "../services/transaction.service";

async function CreateTransactionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract userId from JWT token (set by TokenVerification middleware)
    const user_id = req.user.id;

    // Add userId to the request body before passing to service
    const transactionData = {
      ...req.body,
      user_id,
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
    const { id } = req.params;
    // const userId = req.user?.id; // Assuming you're attaching the authenticated user to req.user
    // const { userId } = req.body; // Ngambil dari body dulu, karena belum ada authentication
    const user_id = req.user?.id;

    if (!req.file) {
      return next(new Error("Payment proof image is required"));
    }

    if (!user_id) {
      return next(new Error("Unauthorized: User ID missing"));
    }

    const updatedTransaction = await PaymentTransactionService({
      id: String(id),
      user_id,
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
    const { id } = req.params;
    const { action } = req.body;

    // Get the user ID from the authenticated user
    const user_id = req.user.id;

    // Call the service with the correct parameter name
    const updatedTransaction = await EOActionTransactionService({
      id: String(id),
      user_id, // This should match the parameter name in your service
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
    const user_id = req.user.id;

    // Call the service to get the user's tickets
    const tickets = await GetUserTicketsService(user_id);

    // Send response with the tickets data
    res.status(200).json({
      message: "User tickets retrieved successfully",
      data: tickets,
    });
  } catch (err) {
    next(err);
  }
}

async function GetTransactionByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await GetTransactionByIdService(id, userId);

    res.status(200).json({
      message: "Transaction retrieved successfully",
      data: transaction,
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
  GetTransactionByIdController,
};

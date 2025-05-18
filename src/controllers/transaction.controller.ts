import { Request, Response, NextFunction } from "express";
import {
  CreateTransactionService,
  PaymentTransactionService,
  EOActionTransactionService,
  GetUserTicketsService,
  GetTransactionByIdService,
  GenerateFreeTicketService,
} from "../services/transaction.service";

async function CreateTransactionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user_id = req.user.id;

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

async function PaymentTransactionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
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

    res.status(200).json({
      message: "Payment proof submitted successfully",
      data: updatedTransaction,
    });
  } catch (err) {
    next(err);
  }
}

async function EOActionTransactionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const user_id = req.user.id;

    const updatedTransaction = await EOActionTransactionService({
      id: String(id),
      user_id, 
      action,
    });

    res.status(200).json({
      message: "Transaction status updated successfully",
      data: updatedTransaction,
    });
  } catch (err) {
    next(err);
  }
}

async function GetUserTicketsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user_id = req.user.id;

    const tickets = await GetUserTicketsService(user_id);

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

async function GenerateFreeTicketController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await GenerateFreeTicketService(id, user_id);

    res.status(200).json({
      message: "Free Ticket Created Successfully",
      data: result.tickets,
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
  GenerateFreeTicketController,
};

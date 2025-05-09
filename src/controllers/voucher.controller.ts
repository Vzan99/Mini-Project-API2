import { Response, Request, NextFunction } from "express";
import {
  CreateVoucherService,
  CheckVoucherValidityService,
} from "../services/voucher.service";

async function CreateVoucherController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await CreateVoucherService(req.body);
    res.status(201).send({
      message: "Create Voucher Success",
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function CheckVoucherValidityController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { eventId, voucherCode } = req.query;

    if (
      !eventId ||
      !voucherCode ||
      typeof eventId !== "string" ||
      typeof voucherCode !== "string"
    ) {
      throw new Error("Event ID and voucher code are required");
    }

    const result = await CheckVoucherValidityService(eventId, voucherCode);

    res.status(200).json({
      message: result.message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export { CreateVoucherController, CheckVoucherValidityController };

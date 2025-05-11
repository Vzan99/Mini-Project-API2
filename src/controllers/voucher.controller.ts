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
    const { event_id, voucher_code } = req.query;

    if (
      !event_id ||
      !voucher_code ||
      typeof event_id !== "string" ||
      typeof voucher_code !== "string"
    ) {
      throw new Error("Event ID and voucher code are required");
    }

    const result = await CheckVoucherValidityService(event_id, voucher_code);

    res.status(200).json({
      message: result.message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export { CreateVoucherController, CheckVoucherValidityController };

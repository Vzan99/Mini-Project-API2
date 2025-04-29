import { Response, Request, NextFunction } from "express";
import { CreateVoucherService } from "../services/voucher.service";

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

export { CreateVoucherController };

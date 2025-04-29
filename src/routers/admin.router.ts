import { Router } from "express";
// import { authMiddleware } from "../middlewares/auth";            // your auth layer
import { CancelTransactionController } from "../controllers/admin.controller";

const router = Router();

// Only event organizers (or admins) can cancel transactions
router.post(
  "/transactions/:id/cancel",
  //   authMiddleware("event_organizer"),
  CancelTransactionController
);

export default router;

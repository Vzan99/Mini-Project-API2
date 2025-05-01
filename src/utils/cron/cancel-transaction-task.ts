import cron from "node-cron";
import { AutoCancelTransactionService } from "../../services/transaction.service";

async function AutoCancelTransactionTask() {
  // Runs once every 3 hour at minute 0
  cron.schedule("0 */3 * * *", () => {
    AutoCancelTransactionService();
  });
}

export { AutoCancelTransactionTask };

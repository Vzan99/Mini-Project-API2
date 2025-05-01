import cron from "node-cron";
import { AutoExpireTransactionService } from "../../services/transaction.service";

async function AutoExpireTransactionTask() {
  // Run every 5 minutes (adjust as needed)
  cron.schedule("*/5 * * * *", () => {
    AutoExpireTransactionService();
  });
}

export { AutoExpireTransactionTask };

import { PrismaClient, transaction_status } from "@prisma/client";
import { CancelTransactionService } from "../services/transaction.service";

const prisma = new PrismaClient();

async function expireOld() {
  const toExpire = await prisma.transaction.findMany({
    where: {
      status: transaction_status.waiting_for_payment,
      expires_at: { lt: new Date() },
    },
  });

  for (const tx of toExpire) {
    await CancelTransactionService(tx.id);
  }
  console.log(`Expired ${toExpire.length} transactions.`);
}

expireOld().finally(() => process.exit());

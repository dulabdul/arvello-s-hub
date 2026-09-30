import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const transactions = await prisma.transaction.findMany({ where: { invoiceId: { not: null } } });
  let deletedCount = 0;
  for (const t of transactions) {
    if (t.invoiceId) {
      const inv = await prisma.invoice.findUnique({ where: { id: t.invoiceId } });
      if (!inv) {
        await prisma.transaction.delete({ where: { id: t.id } });
        deletedCount++;
        console.log(`Deleted orphaned transaction ${t.id} (amount: ${t.amount})`);
      }
    }
  }
  console.log(`Cleanup complete. Deleted ${deletedCount} orphaned transactions.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());

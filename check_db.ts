import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const transactions = await prisma.transaction.findMany({ where: { invoiceId: { not: null } } });
  console.log('Transactions with invoiceId:', transactions.map(t => ({ id: t.id, invoiceId: t.invoiceId, amount: t.amount })));
  
  const invoices = await prisma.invoice.findMany({ select: { id: true, total: true } });
  console.log('Invoices:', invoices);
}
main().catch(console.error).finally(() => prisma.$disconnect());

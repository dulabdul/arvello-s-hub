import { prisma } from "@/lib/db/prisma";
import { TransactionType } from "@prisma/client";

export async function getTransactions(limit?: number) {
  return await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
    take: limit,
  });
}

export async function createTransaction(data: {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date?: Date;
  invoiceId?: string;
}) {
  return await prisma.transaction.create({
    data: {
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date || new Date(),
      invoiceId: data.invoiceId,
    },
  });
}

export async function updateTransaction(id: string, data: Partial<{
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: Date;
}>) {
  return await prisma.transaction.update({
    where: { id },
    data,
  });
}

export async function deleteTransaction(id: string) {
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) throw new Error("Transaksi tidak ditemukan");
  
  if (tx.invoiceId) {
    throw new Error("CANNOT_DELETE_INVOICE_TRANSACTION");
  }

  return await prisma.transaction.delete({
    where: { id },
  });
}

import { prisma } from "@/lib/db/prisma";

export async function getFinancialSummary(startDate?: Date, endDate?: Date) {
  const whereClause = (startDate || endDate) ? {
    date: {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    }
  } : {};

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
  });

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const monthlyData = Array.from({ length: 12 }).map((_, i) => ({
    name: new Date(new Date().getFullYear(), i, 1).toLocaleString('id-ID', { month: 'short' }),
    income: 0,
    expense: 0
  }));

  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};

  transactions.forEach(t => {
    const d = new Date(t.date);
    if (d.getFullYear() === new Date().getFullYear()) {
      if (t.type === 'INCOME') {
        monthlyData[d.getMonth()].income += t.amount;
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
      } else {
        monthlyData[d.getMonth()].expense += t.amount;
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      }
    }
  });

  // Pending Receivables
  const pendingInvoices = await prisma.invoice.findMany({
    where: { status: { in: ['UNPAID', 'SENT', 'OVERDUE'] } }
  });
  const pendingReceivables = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Top Clients
  const paidInvoices = await prisma.invoice.findMany({
    where: { status: 'PAID' },
    include: { client: true }
  });
  
  const clientRevenueMap: Record<string, { id: string, name: string, total: number }> = {};
  paidInvoices.forEach(inv => {
    if (!clientRevenueMap[inv.clientId]) {
      clientRevenueMap[inv.clientId] = { id: inv.clientId, name: inv.client.name, total: 0 };
    }
    clientRevenueMap[inv.clientId].total += inv.total;
  });
  
  const topClients = Object.values(clientRevenueMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    totalIncome,
    totalExpense,
    netProfit,
    monthlyData,
    incomeByCategory: Object.entries(incomeByCategory).map(([name, value]) => ({ name, value })),
    expenseByCategory: Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })),
    pendingReceivables,
    topClients,
  };
}

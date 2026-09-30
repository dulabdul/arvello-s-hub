import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const [
    clientsCount,
    activeProjects,
    unpaidInvoices,
    incomeTransactions,
    expenseTransactions,
    projects,
    recentProjects,
    recentInvoices
  ] = await Promise.all([
    prisma.client.count(),
    prisma.project.findMany({ where: { status: { in: ["IN_PROGRESS", "REVIEW", "NEGOTIATION"] } } }),
    prisma.invoice.findMany({ where: { status: { in: ["UNPAID", "SENT", "OVERDUE"] } } }),
    prisma.transaction.aggregate({ where: { type: "INCOME" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: "EXPENSE" }, _sum: { amount: true } }),
    prisma.project.findMany(),
    prisma.project.findMany({ take: 4, orderBy: { createdAt: 'desc' }, include: { client: true } }),
    prisma.invoice.findMany({ take: 4, orderBy: { createdAt: 'desc' }, include: { client: true, project: true } }),
  ]);

  const unpaidTotal = unpaidInvoices.reduce((sum, i) => sum + i.total, 0);
  const incomeTotal = incomeTransactions._sum.amount || 0;
  const expenseTotal = expenseTransactions._sum.amount || 0;
  const netProfit = incomeTotal - expenseTotal;
  const totalPipelineValue = projects.reduce((sum, p) => sum + p.value, 0);

  const summary = {
    totalClients: clientsCount,
    activeProjectsCount: activeProjects.length,
    unpaidInvoicesCount: unpaidInvoices.length,
    unpaidInvoicesAmount: unpaidTotal,
    netProfitAmount: netProfit,
    totalPipelineValue,
    recentProjects: recentProjects.map(p => ({
      ...p,
      clientName: p.client.name,
      clientCompany: p.client.company
    })),
    recentInvoices: recentInvoices.map(i => ({
      ...i,
      clientName: i.client.name,
      clientCompany: i.client.company,
      projectName: i.project.name,
      dueDate: i.dueDate.toISOString().split("T")[0],
    })),
  };

  return NextResponse.json(summary);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const [
    clientsCount,
    activeProjects,
    unpaidInvoices,
    paidInvoices,
    projects,
    recentProjects,
    recentInvoices
  ] = await Promise.all([
    prisma.client.count(),
    prisma.project.findMany({ where: { status: { in: ["IN_PROGRESS", "REVIEW", "NEGOTIATION"] } } }),
    prisma.invoice.findMany({ where: { status: { in: ["UNPAID", "SENT"] } } }),
    prisma.invoice.findMany({ where: { status: "PAID" } }),
    prisma.project.findMany(),
    prisma.project.findMany({ take: 4, orderBy: { createdAt: 'desc' }, include: { client: true } }),
    prisma.invoice.findMany({ take: 4, orderBy: { createdAt: 'desc' }, include: { client: true, project: true } }),
  ]);

  const unpaidTotal = unpaidInvoices.reduce((sum, i) => sum + i.total, 0);
  const paidTotal = paidInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalPipelineValue = projects.reduce((sum, p) => sum + p.value, 0);

  const summary = {
    totalClients: clientsCount,
    activeProjectsCount: activeProjects.length,
    unpaidInvoicesCount: unpaidInvoices.length,
    unpaidInvoicesAmount: unpaidTotal,
    paidInvoicesAmount: paidTotal,
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

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { calculateSubtotal, calculateTotal } from "@/lib/services/invoice/calculator";

const itemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Deskripsi item wajib diisi"),
  quantity: z.number().positive(),
  rate: z.number().nonnegative(),
  amount: z.number().nonnegative(),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Klien wajib dipilih"),
  projectId: z.string().min(1, "Proyek wajib dipilih"),
  dueDate: z.string().min(1, "Jatuh tempo wajib diisi"),
  currency: z.string().default("IDR"),
  tax: z.number().default(0),
  discount: z.number().default(0),
  items: z.array(itemSchema).min(1, "Minimal 1 item invoice"),
  status: z.enum(["DRAFT", "SENT", "UNPAID", "PAID", "OVERDUE"]).default("UNPAID"),
});

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    include: { client: true, project: true },
    orderBy: { createdAt: 'desc' }
  });
  
  const mapped = invoices.map(i => ({
    ...i,
    clientName: i.client.name,
    clientCompany: i.client.company,
    clientEmail: i.client.email,
    projectName: i.project.name,
    dueDate: i.dueDate.toISOString().split("T")[0],
    paidAt: i.paidAt ? i.paidAt.toISOString().split("T")[0] : null,
  }));
  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = invoiceSchema.parse(body);

    const client = await prisma.client.findUnique({ where: { id: validated.clientId } });
    const project = await prisma.project.findUnique({ where: { id: validated.projectId } });

    if (!client || !project) {
      return NextResponse.json({ error: "Klien atau proyek tidak valid" }, { status: 400 });
    }

    const subtotal = calculateSubtotal(validated.items);
    const total = calculateTotal(subtotal, validated.tax, validated.discount);

    // Auto generate next invoice number
    const count = await prisma.invoice.count();
    const year = new Date().getFullYear();
    const number = `INV-${year}-${String(count + 1).padStart(3, "0")}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        number,
        clientId: client.id,
        projectId: project.id,
        items: validated.items as any,
        subtotal,
        tax: validated.tax,
        discount: validated.discount,
        total,
        currency: validated.currency,
        status: validated.status,
        dueDate: new Date(validated.dueDate),
      },
      include: { client: true, project: true }
    });

    return NextResponse.json({
      ...newInvoice,
      clientName: newInvoice.client.name,
      clientCompany: newInvoice.client.company,
      clientEmail: newInvoice.client.email,
      projectName: newInvoice.project.name,
      dueDate: newInvoice.dueDate.toISOString().split("T")[0],
      paidAt: newInvoice.paidAt ? newInvoice.paidAt.toISOString().split("T")[0] : null,
    }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal membuat invoice" }, { status: 500 });
  }
}

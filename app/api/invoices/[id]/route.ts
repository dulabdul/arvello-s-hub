import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { createTransaction } from "@/lib/services/finance/transactions";

const updateStatusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "UNPAID", "PAID", "OVERDUE"]),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = updateStatusSchema.parse(body);

    const paidAt = status === "PAID" ? new Date() : null;

    try {
      const existingInvoice = await prisma.invoice.findUnique({ where: { id } });
      if (!existingInvoice) {
        return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
      }

      const updated = await prisma.invoice.update({
        where: { id },
        data: { status, paidAt },
        include: { client: true, project: true }
      });

      if (status === "PAID" && existingInvoice.status !== "PAID") {
        try {
          await createTransaction({
            type: "INCOME",
            amount: updated.total,
            category: "Pembayaran Invoice",
            description: `Pelunasan Invoice ${updated.number} dari ${updated.client.name}`,
            date: new Date(),
            invoiceId: updated.id,
          });
        } catch (err) {
          console.error("Gagal mencatat transaksi masuk secara otomatis:", err);
        }
      } else if (status !== "PAID" && existingInvoice.status === "PAID") {
        try {
          await prisma.transaction.deleteMany({ where: { invoiceId: id } });
        } catch (err) {
          console.error("Gagal menghapus transaksi terkait:", err);
        }
      }

      return NextResponse.json({
        ...updated,
        clientName: updated.client.name,
        clientCompany: updated.client.company,
        clientEmail: updated.client.email,
        projectName: updated.project.name,
        dueDate: updated.dueDate.toISOString().split("T")[0],
        paidAt: updated.paidAt ? updated.paidAt.toISOString().split("T")[0] : null,
      });
    } catch (e) {
      return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal memperbarui status invoice" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.transaction.deleteMany({ where: { invoiceId: id } });
    await prisma.invoice.delete({ where: { id } });
  } catch(e) {}
  return NextResponse.json({ success: true });
}

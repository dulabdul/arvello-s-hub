import { NextResponse } from "next/server";
import { deleteTransaction } from "@/lib/services/finance/transactions";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteTransaction(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "CANNOT_DELETE_INVOICE_TRANSACTION") {
      return NextResponse.json({ error: "Transaksi otomatis dari invoice tidak dapat dihapus manual" }, { status: 403 });
    }
    console.error("Failed to delete transaction:", error);
    return NextResponse.json({ error: "Gagal menghapus transaksi" }, { status: 500 });
  }
}

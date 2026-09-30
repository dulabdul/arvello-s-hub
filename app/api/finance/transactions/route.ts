import { NextResponse } from "next/server";
import { createTransaction } from "@/lib/services/finance/transactions";
import { z } from "zod";

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive(),
  category: z.string().min(1, "Kategori wajib diisi"),
  description: z.string().optional(),
  date: z.string().transform((str) => new Date(str)),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = transactionSchema.parse(body);

    const transaction = await createTransaction({
      type: validated.type,
      amount: validated.amount,
      category: validated.category,
      description: validated.description,
      date: validated.date,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Failed to create transaction:", error);
    return NextResponse.json({ error: "Gagal mencatat transaksi" }, { status: 500 });
  }
}

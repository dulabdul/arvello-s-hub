import { NextResponse } from "next/server";
import { getFinancialSummary } from "@/lib/services/finance/reports";
import { getTransactions } from "@/lib/services/finance/transactions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeTransactions = searchParams.get('includeTransactions') === 'true';

  try {
    const summary = await getFinancialSummary();
    const data: any = { summary };

    if (includeTransactions) {
      data.transactions = await getTransactions();
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch finance summary:", error);
    return NextResponse.json({ error: "Gagal mengambil data keuangan" }, { status: 500 });
  }
}

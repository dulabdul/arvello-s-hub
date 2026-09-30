import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "TX_CATEGORIES" } });
    const categories = setting 
      ? JSON.parse(setting.value) 
      : ["Layanan Dasar", "Hosting & Server", "Software & Lisensi", "Peralatan", "Lainnya"];
      
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ categories: ["Umum"] });
  }
}

export async function POST(request: Request) {
  try {
    const { categories } = await request.json();
    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: "Format tidak valid" }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: "TX_CATEGORIES" },
      update: { value: JSON.stringify(categories) },
      create: { key: "TX_CATEGORIES", value: JSON.stringify(categories) },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan kategori" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export interface RegistrarItem {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_REGISTRARS: RegistrarItem[] = [
  { id: "reg-1", name: "Cloudflare", color: "#F38020" },
  { id: "reg-2", name: "Namecheap", color: "#DE3723" },
  { id: "reg-3", name: "GoDaddy", color: "#00A4A6" },
  { id: "reg-4", name: "RumahWeb", color: "#0066B3" },
  { id: "reg-5", name: "Hostinger", color: "#673DE6" },
  { id: "reg-6", name: "Niagahoster", color: "#0078FF" },
  { id: "reg-7", name: "DomaiNesia", color: "#0B2545" },
];

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "DOMAIN_REGISTRARS" },
    });

    const registrars: RegistrarItem[] = setting
      ? JSON.parse(setting.value)
      : DEFAULT_REGISTRARS;

    return NextResponse.json({ registrars });
  } catch (error) {
    console.error("Error fetching registrars:", error);
    return NextResponse.json({ registrars: DEFAULT_REGISTRARS });
  }
}

export async function POST(request: Request) {
  try {
    const { registrars } = await request.json();
    if (!Array.isArray(registrars)) {
      return NextResponse.json({ error: "Format daftar registrar tidak valid" }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: "DOMAIN_REGISTRARS" },
      update: { value: JSON.stringify(registrars) },
      create: { key: "DOMAIN_REGISTRARS", value: JSON.stringify(registrars) },
    });

    return NextResponse.json({ success: true, registrars });
  } catch (error) {
    console.error("Error saving registrars:", error);
    return NextResponse.json({ error: "Gagal menyimpan konfigurasi registrar" }, { status: 500 });
  }
}

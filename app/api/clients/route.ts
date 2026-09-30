import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(1, "Nama klien wajib diisi"),
  company: z.string().optional().nullable(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = clientSchema.parse(body);
    const newClient = await prisma.client.create({
      data: validated
    });
    return NextResponse.json(newClient, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menyimpan klien" }, { status: 500 });
  }
}

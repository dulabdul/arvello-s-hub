import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  company: z.string().optional().nullable(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateSchema.parse(body);
    
    try {
      const updated = await prisma.client.update({
        where: { id },
        data: validated,
      });
      return NextResponse.json(updated);
    } catch (e) {
      return NextResponse.json({ error: "Klien tidak ditemukan" }, { status: 404 });
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal memperbarui klien" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.client.delete({ where: { id } });
  } catch (e) {
    // Ignore if already deleted
  }
  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["LEAD", "NEGOTIATION", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"]).optional(),
  contractType: z.enum(["FIXED", "HOURLY"]).optional(),
  value: z.number().nonnegative().optional(),
  startDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateSchema.parse(body);
    
    const updateData: any = { ...validated };
    if (validated.startDate) updateData.startDate = new Date(validated.startDate);
    if (validated.deadline) updateData.deadline = new Date(validated.deadline);
    
    try {
      const updated = await prisma.project.update({
        where: { id },
        data: updateData,
        include: { client: true }
      });
      return NextResponse.json({
        ...updated,
        clientName: updated.client.name,
        clientCompany: updated.client.company
      });
    } catch (e) {
      return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal memperbarui proyek" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.project.delete({ where: { id } });
  } catch(e) {}
  return NextResponse.json({ success: true });
}

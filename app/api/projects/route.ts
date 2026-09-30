import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const projectSchema = z.object({
  clientId: z.string().min(1, "Klien wajib dipilih"),
  name: z.string().min(1, "Nama proyek wajib diisi"),
  description: z.string().optional().nullable(),
  status: z.enum(["LEAD", "NEGOTIATION", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"]).default("LEAD"),
  contractType: z.enum(["FIXED", "HOURLY"]).default("FIXED"),
  value: z.number().nonnegative().default(0),
  startDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
});

export async function GET() {
  const projects = await prisma.project.findMany({
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  });
  
  const mapped = projects.map(p => ({
    ...p,
    clientName: p.client.name,
    clientCompany: p.client.company
  }));
  
  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = projectSchema.parse(body);

    const client = await prisma.client.findUnique({ where: { id: validated.clientId } });
    if (!client) {
      return NextResponse.json({ error: "Klien tidak ditemukan" }, { status: 404 });
    }

    const newProject = await prisma.project.create({
      data: {
        ...validated,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        deadline: validated.deadline ? new Date(validated.deadline) : null,
      },
      include: { client: true }
    });

    return NextResponse.json({
      ...newProject,
      clientName: newProject.client.name,
      clientCompany: newProject.client.company
    }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menyimpan proyek" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const proposal = await prisma.proposal.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: { name: true, company: true }
        }
      }
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposal" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await req.json();
    
    // Determine status from payload or default to undefined (no change)
    const dataToUpdate: any = {
      title: body.title,
      clientId: body.clientId,
      prospectName: body.prospectName,
      prospectEmail: body.prospectEmail,
      content: body.content,
      total: body.total,
      currency: body.currency,
      status: body.status,
    };

    if (body.status === "SENT") {
      dataToUpdate.sentAt = new Date();
    }

    const proposal = await prisma.proposal.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json(proposal);
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Failed to update proposal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    await prisma.proposal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting proposal:", error);
    return NextResponse.json(
      { error: "Failed to delete proposal" },
      { status: 500 }
    );
  }
}

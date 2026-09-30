import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const proposals = await prisma.proposal.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { name: true, company: true }
        }
      }
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Create new proposal
    const proposal = await prisma.proposal.create({
      data: {
        title: body.title,
        clientId: body.clientId || null,
        prospectName: body.prospectName || null,
        prospectEmail: body.prospectEmail || null,
        content: body.content, // Should be array of sections
        total: body.total || 0,
        currency: body.currency || "IDR",
        status: body.status || "DRAFT",
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json(
      { error: "Failed to create proposal" },
      { status: 500 }
    );
  }
}

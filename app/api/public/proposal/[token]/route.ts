import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const proposal = await prisma.proposal.findUnique({
      where: { token },
      include: {
        client: { select: { name: true, company: true } }
      }
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Track viewed status if it's the first time
    if (!proposal.viewedAt && (proposal.status === "DRAFT" || proposal.status === "SENT")) {
      await prisma.proposal.update({
        where: { id: proposal.id },
        data: {
          viewedAt: new Date(),
          status: "VIEWED"
        }
      });
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error("Error fetching public proposal:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposal" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { action } = await req.json();

    if (!["ACCEPT", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { token },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const updatedProposal = await prisma.proposal.update({
      where: { id: proposal.id },
      data: {
        status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED"
      }
    });

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error("Error updating proposal status:", error);
    return NextResponse.json(
      { error: "Failed to update proposal" },
      { status: 500 }
    );
  }
}

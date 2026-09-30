import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getDnsRecords, createDnsRecord, deleteDnsRecord } from "@/lib/services/cloudflare/api";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const domain = await prisma.domain.findUnique({ where: { id } });
    if (!domain || !domain.zoneId) {
      return NextResponse.json({ error: "Domain or Zone ID not found" }, { status: 404 });
    }

    const records = await getDnsRecords(domain.zoneId);
    return NextResponse.json(records);
  } catch (error: any) {
    console.error("Error fetching DNS records:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch DNS records" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const domain = await prisma.domain.findUnique({ where: { id } });
    if (!domain || !domain.zoneId) {
      return NextResponse.json({ error: "Domain or Zone ID not found" }, { status: 404 });
    }

    const body = await req.json();
    const result = await createDnsRecord(domain.zoneId, body);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error creating DNS record:", error);
    return NextResponse.json({ error: error.message || "Failed to create DNS record" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const domain = await prisma.domain.findUnique({ where: { id } });
    if (!domain || !domain.zoneId) {
      return NextResponse.json({ error: "Domain or Zone ID not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get("recordId");

    if (!recordId) {
      return NextResponse.json({ error: "recordId is required" }, { status: 400 });
    }

    const result = await deleteDnsRecord(domain.zoneId, recordId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error deleting DNS record:", error);
    return NextResponse.json({ error: error.message || "Failed to delete DNS record" }, { status: 500 });
  }
}

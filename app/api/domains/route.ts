import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createZone, getZone } from "@/lib/services/cloudflare/api";

export async function GET() {
  try {
    const rawDomains = await prisma.domain.findMany({
      include: { project: { include: { client: true } } },
      orderBy: { createdAt: "desc" }
    });

    const domains = rawDomains.map((domain: any) => {
      const project = domain.project;
      return {
        ...domain,
        project: project ? {
          name: project.name,
          client: {
            name: project.client.name,
            company: project.client.company
          }
        } : { name: "Unknown Project", client: { name: "Unknown", company: null } }
      };
    });

    // Optionally: Update status for domains that are PENDING by checking Cloudflare
    // For MVP, we can do this on-demand or background, let's do a quick sync here
    for (const domain of domains) {
      if (domain.status === "PENDING" && domain.zoneId) {
        try {
          const zoneInfo = await getZone(domain.zoneId);
          if (zoneInfo.status === "active") {
            domain.status = "ACTIVE";
            await prisma.domain.update({
              where: { id: domain.id },
              data: { status: "ACTIVE" }
            });
          }
        } catch (e) {
          console.error("Failed to sync zone status", e);
        }
      }
    }

    return NextResponse.json(domains);
  } catch (error) {
    console.error("Error fetching domains:", error);
    return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, registrar, projectId, expiresAt } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama domain wajib diisi" }, { status: 400 });
    }

    // 1. Call Cloudflare API to create zone
    let zoneResult;
    try {
      zoneResult = await createZone(name);
    } catch (cfError: any) {
      return NextResponse.json({ error: cfError.message || "Gagal membuat zone di Cloudflare" }, { status: 400 });
    }

    // 2. Save to database
    const domain = await prisma.domain.create({
      data: {
        name: zoneResult.name,
        zoneId: zoneResult.id,
        registrar: registrar || null,
        projectId: projectId || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: zoneResult.status === "active" ? "ACTIVE" : "PENDING",
      }
    });

    return NextResponse.json(domain, { status: 201 });
  } catch (error) {
    console.error("Error adding domain:", error);
    return NextResponse.json({ error: "Failed to add domain" }, { status: 500 });
  }
}

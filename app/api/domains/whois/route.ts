import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { lookupWhois } from "@/lib/services/whois";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { domainId, domainName, batchAll } = body;

    // Mode 1: Lookup for a specific domain name (e.g. before adding a domain)
    if (domainName && !domainId && !batchAll) {
      const result = await lookupWhois(domainName);
      return NextResponse.json(result);
    }

    // Mode 2: Auto-assign for a single domain in the database
    if (domainId) {
      const domain = await prisma.domain.findUnique({
        where: { id: domainId },
      });

      if (!domain) {
        return NextResponse.json({ error: "Domain tidak ditemukan" }, { status: 404 });
      }

      const whois = await lookupWhois(domain.name);

      const updateData: {
        registrar?: string | null;
        expiresAt?: Date | null;
        createdAt?: Date;
      } = {};

      if (whois.matchedRegistrar) {
        updateData.registrar = whois.matchedRegistrar;
      }

      if (whois.expiresAt) {
        updateData.expiresAt = new Date(whois.expiresAt);
      }

      // If domain.createdAt is still the default/placeholder and whois found real creation date
      if (whois.createdAt) {
        updateData.createdAt = new Date(whois.createdAt);
      }

      const updated = await prisma.domain.update({
        where: { id: domainId },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        domain: updated,
        whois,
      });
    }

    // Mode 3: Batch Auto-assign for all domains
    if (batchAll) {
      const domains = await prisma.domain.findMany({
        select: { id: true, name: true, registrar: true, expiresAt: true },
      });

      let updatedCount = 0;
      const results: { domain: string; registrar?: string | null; expiresAt?: string | null }[] = [];

      // Process in small sequential chunks of 3 to avoid whois rate limits
      for (let i = 0; i < domains.length; i += 3) {
        const chunk = domains.slice(i, i + 3);
        await Promise.all(
          chunk.map(async (d) => {
            try {
              const whois = await lookupWhois(d.name);
              const dataToUpdate: any = {};

              if (whois.matchedRegistrar) {
                dataToUpdate.registrar = whois.matchedRegistrar;
              }
              if (whois.expiresAt) {
                dataToUpdate.expiresAt = new Date(whois.expiresAt);
              }
              if (whois.createdAt) {
                dataToUpdate.createdAt = new Date(whois.createdAt);
              }

              if (Object.keys(dataToUpdate).length > 0) {
                await prisma.domain.update({
                  where: { id: d.id },
                  data: dataToUpdate,
                });
                updatedCount++;
                results.push({
                  domain: d.name,
                  registrar: whois.matchedRegistrar,
                  expiresAt: whois.expiresAt,
                });
              }
            } catch (err) {
              console.error(`Error querying whois for ${d.name}:`, err);
            }
          })
        );
      }

      return NextResponse.json({
        success: true,
        message: `Berhasil memeriksa ${domains.length} domain. ${updatedCount} domain berhasil diperbarui via WHOIS.`,
        updatedCount,
        results,
      });
    }

    return NextResponse.json(
      { error: "Parameter tidak lengkap (butuh domainId, domainName, atau batchAll)" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error in whois route:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses WHOIS" },
      { status: 500 }
    );
  }
}

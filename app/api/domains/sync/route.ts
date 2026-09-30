import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { listZones } from "@/lib/services/cloudflare/api";
import { DomainStatus } from "@prisma/client";

export async function POST() {
  try {
    // 1. Ambil zona dari Cloudflare
    const zones = await listZones();
    
    if (!Array.isArray(zones)) {
      return NextResponse.json({ error: "Invalid response from Cloudflare" }, { status: 500 });
    }

    let syncedCount = 0;

    for (const zone of zones) {
      // 2. Cek apakah domain sudah ada di database lokal
      const existingDomain = await prisma.domain.findUnique({
        where: { name: zone.name }
      });

      let status: DomainStatus = "PENDING";
      if (zone.status === "active") status = "ACTIVE";
      if (zone.status === "moved") status = "MOVED";

      if (existingDomain) {
        // Update status & zoneId jika belum ada atau berubah
        await prisma.domain.update({
          where: { id: existingDomain.id },
          data: { 
            zoneId: zone.id,
            status: status 
          }
        });
      } else {
        // Tambahkan domain baru ke database tanpa project
        await prisma.domain.create({
          data: {
            name: zone.name,
            zoneId: zone.id,
            status: status,
            projectId: null,
          }
        });
        syncedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sinkronisasi berhasil. ${syncedCount} domain baru ditambahkan.`,
      syncedCount 
    });
  } catch (error: any) {
    console.error("Cloudflare Sync Error:", error);
    return NextResponse.json({ error: error.message || "Gagal sinkronisasi domain dengan Cloudflare." }, { status: 500 });
  }
}

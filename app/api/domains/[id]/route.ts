import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCloudflareAuth } from "@/lib/services/cloudflare/api";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const domain = await prisma.domain.findUnique({
      where: { id }
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    if (domain.zoneId) {
      try {
        const { token } = await getCloudflareAuth();
        const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${domain.zoneId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.warn("CF Delete Zone Error:", data.errors);
        }
      } catch (cfErr) {
        console.warn("Failed to delete zone from Cloudflare:", cfErr);
      }
    }

    // Always delete from local DB
    await prisma.domain.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting domain:", error);
    return NextResponse.json({ error: error.message || "Failed to delete domain" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { generateDomainExpiryDigestHtml } from "@/lib/email/domainExpiryTemplate";
import { DEFAULT_REGISTRARS, RegistrarItem } from "@/app/api/domains/registrars/route";

const prisma = new PrismaClient();

interface DomainAlertItem {
  id: string;
  name: string;
  registrar?: string | null;
  registrarColor?: string | null;
  expiresAt: string;
  diffDays: number;
  threshold: number;
}

export async function GET(req: Request) {
  return handleCronReminders(req);
}

export async function POST(req: Request) {
  return handleCronReminders(req);
}

async function handleCronReminders(req: Request) {
  try {
    // 1. Security Check: verify CRON_SECRET if configured
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get("authorization");
      const url = new URL(req.url);
      const querySecret = url.searchParams.get("secret");
      const token = authHeader?.replace(/^Bearer\s+/i, "") || querySecret;

      if (token !== cronSecret) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid or missing CRON_SECRET" },
          { status: 401 }
        );
      }
    }

    // 2. Fetch registrar color metadata
    const setting = await prisma.setting.findUnique({
      where: { key: "DOMAIN_REGISTRARS" },
    });
    const registrars: RegistrarItem[] = setting
      ? JSON.parse(setting.value)
      : DEFAULT_REGISTRARS;

    const getRegistrarColor = (name?: string | null) => {
      if (!name) return "#64748B";
      return registrars.find((r) => r.name.toLowerCase() === name.toLowerCase())?.color || "#64748B";
    };

    // 3. Fetch active domains that have expiration date set
    const domains = await prisma.domain.findMany({
      where: {
        expiresAt: { not: null },
      },
    });

    // Fetch reminder logs safely
    const domainIds = domains.map((d) => d.id);
    let reminderLogs: any[] = [];
    try {
      if ((prisma as any).domainReminderLog) {
        reminderLogs = await (prisma as any).domainReminderLog.findMany({
          where: {
            domainId: { in: domainIds },
          },
        });
      }
    } catch (e) {
      console.warn("Could not load reminder logs:", e);
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const grouped = {
      critical: [] as DomainAlertItem[], // <= 3 days
      urgent: [] as DomainAlertItem[],   // <= 7 days
      warning: [] as DomainAlertItem[],  // <= 14 days
      upcoming: [] as DomainAlertItem[], // <= 30 days
    };

    // 4. Evaluate each domain against notification milestone thresholds [3, 7, 14, 30]
    for (const domain of domains) {
      if (!domain.expiresAt) continue;

      const expDate = new Date(domain.expiresAt);
      const expDateMidnight = new Date(expDate);
      expDateMidnight.setHours(0, 0, 0, 0);

      const diffTime = expDateMidnight.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Match milestone threshold bracket
      let threshold: number | null = null;
      let bucket: "critical" | "urgent" | "warning" | "upcoming" | null = null;

      if (diffDays <= 3 && diffDays >= 0) {
        threshold = 3;
        bucket = "critical";
      } else if (diffDays <= 7 && diffDays > 3) {
        threshold = 7;
        bucket = "urgent";
      } else if (diffDays <= 14 && diffDays > 7) {
        threshold = 14;
        bucket = "warning";
      } else if (diffDays <= 30 && diffDays > 14) {
        threshold = 30;
        bucket = "upcoming";
      }

      if (threshold !== null && bucket !== null) {
        // Check idempotency: has this domain already received this milestone for this expiry cycle?
        const alreadyLogged = reminderLogs.some((log: any) => {
          const logExpDate = new Date(log.expiresAt);
          return (
            log.domainId === domain.id &&
            log.threshold === threshold &&
            logExpDate.toDateString() === expDate.toDateString()
          );
        });

        if (!alreadyLogged) {
          grouped[bucket].push({
            id: domain.id,
            name: domain.name,
            registrar: domain.registrar,
            registrarColor: getRegistrarColor(domain.registrar),
            expiresAt: domain.expiresAt.toISOString(),
            diffDays,
            threshold,
          });
        }
      }
    }

    const allAlerts: DomainAlertItem[] = [
      ...grouped.critical,
      ...grouped.urgent,
      ...grouped.warning,
      ...grouped.upcoming,
    ];

    // If no domains require reminder today
    if (allAlerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Semua domain aman. Tidak ada domain yang menyentuh threshold H-3, H-7, H-14, atau H-30 hari ini.",
        checkedCount: domains.length,
        alertCount: 0,
      });
    }

    // 5. Check Resend API Key
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "RESEND_API_KEY belum dikonfigurasi di file .env. Notifikasi belum dapat dikirim.",
          pendingAlertCount: allAlerts.length,
          pendingAlerts: allAlerts.map((a) => ({ name: a.name, diffDays: a.diffDays, threshold: a.threshold })),
        },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);
    const toEmail = process.env.NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Arvello Hub <onboarding@resend.dev>";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!toEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "NOTIFICATION_EMAIL atau ADMIN_EMAIL belum dikonfigurasi di file .env.",
          pendingAlertCount: allAlerts.length,
        },
        { status: 500 }
      );
    }

    // 6. Generate and send consolidated digest email
    const emailHtml = generateDomainExpiryDigestHtml(grouped, appUrl);
    const minDays = Math.min(...allAlerts.map((a) => a.diffDays));

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `🚨 [DomainOps Alert] ${allAlerts.length} Domain Mendekati Jatuh Tempo (H-${minDays})`,
      html: emailHtml,
    });

    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      return NextResponse.json(
        {
          success: false,
          error: emailResponse.error.message || "Gagal mengirim email via Resend",
        },
        { status: 500 }
      );
    }

    // 7. Record logs in database to guarantee zero duplicates
    const loggedItems = [];
    if ((prisma as any).domainReminderLog) {
      for (const alert of allAlerts) {
        try {
          const log = await (prisma as any).domainReminderLog.create({
            data: {
              domainId: alert.id,
              threshold: alert.threshold,
              expiresAt: new Date(alert.expiresAt),
            },
          });
          loggedItems.push(log.id);
        } catch (err) {
          console.error(`Failed to log reminder for domain ${alert.name}:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengirim email digest untuk ${allAlerts.length} domain ke ${toEmail}`,
      emailId: emailResponse.data?.id,
      alertCount: allAlerts.length,
      loggedCount: loggedItems.length,
      summary: {
        critical: grouped.critical.length,
        urgent: grouped.urgent.length,
        warning: grouped.warning.length,
        upcoming: grouped.upcoming.length,
      },
    });
  } catch (error: any) {
    console.error("Error in domain-reminders cron:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error saat mengecek domain expired",
      },
      { status: 500 }
    );
  }
}

interface DomainAlertItem {
  id: string;
  name: string;
  registrar?: string | null;
  registrarColor?: string | null;
  expiresAt: string;
  diffDays: number;
  threshold: number; // 3, 7, 14, 30
}

interface GroupedAlerts {
  critical: DomainAlertItem[]; // <= 3 days
  urgent: DomainAlertItem[];   // <= 7 days
  warning: DomainAlertItem[];  // <= 14 days
  upcoming: DomainAlertItem[]; // <= 30 days
}

export function generateDomainExpiryDigestHtml(grouped: GroupedAlerts, appUrl: string = "http://localhost:3000"): string {
  const totalCount =
    grouped.critical.length +
    grouped.urgent.length +
    grouped.warning.length +
    grouped.upcoming.length;

  const nowFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const renderDomainCard = (item: DomainAlertItem, badgeBg: string, badgeText: string, label: string) => {
    const formattedDate = new Date(item.expiresAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const regColor = item.registrarColor || "#475569";
    const regName = item.registrar || "Belum diatur";

    return `
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 15px; font-weight: 700; color: #0f172a; letter-spacing: -0.2px;">${item.name}</span>
            <span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 6px; background-color: ${regColor}15; color: ${regColor}; border: 1px solid ${regColor}30;">
              ${regName}
            </span>
          </div>
          <div style="font-size: 12px; color: #64748b;">
            Jatuh Tempo: <strong style="color: #334155;">${formattedDate}</strong>
          </div>
        </div>
        <div style="text-align: right; margin-left: 12px;">
          <span style="display: inline-block; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 8px; background-color: ${badgeBg}; color: ${badgeText};">
            ${label} (H-${item.diffDays})
          </span>
        </div>
      </div>
    `;
  };

  const renderSection = (title: string, icon: string, items: DomainAlertItem[], badgeBg: string, badgeText: string, label: string) => {
    if (items.length === 0) return "";
    return `
      <div style="margin-top: 24px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 16px;">${icon}</span>
          <h3 style="font-size: 13px; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">
            ${title} (${items.length})
          </h3>
        </div>
        <div>
          ${items.map((it) => renderDomainCard(it, badgeBg, badgeText, label)).join("")}
        </div>
      </div>
    `;
  };

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Domain Expiry Digest - Arvello's Hub</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #0f172a;">
      <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; color: #ffffff;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #94a3b8;">
              ARVELLO'S HUB · DOMAINOPS
            </span>
            <span style="font-size: 11px; background-color: rgba(255, 255, 255, 0.12); padding: 3px 8px; border-radius: 6px; color: #cbd5e1;">
              ${nowFormatted}
            </span>
          </div>
          <h1 style="font-size: 22px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.5px;">
            Domain Expiry Digest
          </h1>
          <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.4;">
            Terdapat <strong style="color: #f8fafc;">${totalCount} domain</strong> yang mendekati batas waktu jatuh tempo perpanjangan (H-3, H-7, H-14, H-30).
          </p>
        </div>

        <!-- Content Body -->
        <div style="padding: 24px;">

          <!-- KPI Summary Badges -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px;">
            <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 10px; padding: 10px 8px; text-align: center;">
              <div style="font-size: 18px; font-weight: 800; color: #e11d48;">${grouped.critical.length}</div>
              <div style="font-size: 10px; font-weight: 700; color: #9f1239; text-transform: uppercase;">Sisa 3 Hari</div>
            </div>
            <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 10px; padding: 10px 8px; text-align: center;">
              <div style="font-size: 18px; font-weight: 800; color: #ea580c;">${grouped.urgent.length}</div>
              <div style="font-size: 10px; font-weight: 700; color: #9a3412; text-transform: uppercase;">Sisa 7 Hari</div>
            </div>
            <div style="background-color: #fefce8; border: 1px solid #fef9c3; border-radius: 10px; padding: 10px 8px; text-align: center;">
              <div style="font-size: 18px; font-weight: 800; color: #ca8a04;">${grouped.warning.length}</div>
              <div style="font-size: 10px; font-weight: 700; color: #854d0e; text-transform: uppercase;">Sisa 14 Hari</div>
            </div>
            <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 10px; padding: 10px 8px; text-align: center;">
              <div style="font-size: 18px; font-weight: 800; color: #2563eb;">${grouped.upcoming.length}</div>
              <div style="font-size: 10px; font-weight: 700; color: #1e40af; text-transform: uppercase;">Sisa 30 Hari</div>
            </div>
          </div>

          <!-- Groups -->
          ${renderSection("Kritis (Segera Tindak)", "🚨", grouped.critical, "#fef2f2", "#be123c", "Kritis")}
          ${renderSection("Mendesak", "⚠️", grouped.urgent, "#fff7ed", "#c2410c", "Mendesak")}
          ${renderSection("Peringatan Dua Pekan", "⏳", grouped.warning, "#fefce8", "#a16207", "Peringatan")}
          ${renderSection("Pengingat Awal Satu Bulan", "📅", grouped.upcoming, "#eff6ff", "#1d4ed8", "Pengingat")}

          <!-- Action Button -->
          <div style="margin-top: 32px; text-align: center;">
            <a href="${appUrl}/domains" target="_blank" style="display: inline-block; background-color: #0052cc; color: #ffffff; font-size: 14px; font-weight: 700; padding: 13px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 2px 4px rgba(0, 82, 204, 0.2);">
              Buka Dashboard Domain &rarr;
            </a>
            <p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
              Kelola DNS, update status registrar, atau perbarui tanggal expire di Command Center.
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 11px; color: #64748b;">
          Email ini dikirimkan secara otomatis oleh <strong>Arvello's Hub DomainOps Engine</strong>.<br>
          Diberdayakan oleh Resend & GitHub Actions Cron.
        </div>

      </div>
    </body>
    </html>
  `;
}

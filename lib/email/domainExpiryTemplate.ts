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

export function generateDomainExpiryDigestHtml(
  grouped: GroupedAlerts,
  appUrl: string = "http://localhost:3000"
): string {
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

  const getTierStyles = (tier: "critical" | "urgent" | "warning" | "upcoming") => {
    switch (tier) {
      case "critical":
        return {
          label: "Kritis",
          icon: "🚨",
          badgeBg: "#450a0a",
          badgeText: "#fca5a5",
          badgeBorder: "#dc2626",
          kpiBg: "#1c0a0e",
          kpiNum: "#f87171",
          kpiText: "#fca5a5",
          kpiBorder: "#7f1d1d",
        };
      case "urgent":
        return {
          label: "Mendesak",
          icon: "⚠️",
          badgeBg: "#431407",
          badgeText: "#fdba74",
          badgeBorder: "#ea580c",
          kpiBg: "#1f1007",
          kpiNum: "#fb923c",
          kpiText: "#fdba74",
          kpiBorder: "#9a3412",
        };
      case "warning":
        return {
          label: "Peringatan",
          icon: "⏳",
          badgeBg: "#422006",
          badgeText: "#fde047",
          badgeBorder: "#ca8a04",
          kpiBg: "#1f1807",
          kpiNum: "#facc15",
          kpiText: "#fde047",
          kpiBorder: "#854d0e",
        };
      case "upcoming":
        return {
          label: "Pengingat",
          icon: "📅",
          badgeBg: "#172554",
          badgeText: "#93c5fd",
          badgeBorder: "#2563eb",
          kpiBg: "#0c152e",
          kpiNum: "#60a5fa",
          kpiText: "#93c5fd",
          kpiBorder: "#1e40af",
        };
    }
  };

  const renderDomainCard = (item: DomainAlertItem, tier: "critical" | "urgent" | "warning" | "upcoming") => {
    const styles = getTierStyles(tier);
    const formattedDate = new Date(item.expiresAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const regColor = item.registrarColor || "#38bdf8";
    const regName = item.registrar || "Belum diatur";

    return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #172033; border: 1px solid #28354f; border-radius: 14px; margin-bottom: 12px; overflow: hidden;">
        <tr>
          <td style="padding: 16px 18px;">
            <!-- Row 1: Domain Name + Expiry Pill -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align: middle; text-align: left;">
                  <a href="${appUrl}/domains" target="_blank" style="font-size: 16px; font-weight: 800; color: #ffffff !important; text-decoration: none; letter-spacing: -0.2px;">
                    ${item.name}
                  </a>
                </td>
                <td style="vertical-align: middle; text-align: right; white-space: nowrap;">
                  <span style="display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; background-color: ${styles.badgeBg}; color: ${styles.badgeText} !important; border: 1px solid ${styles.badgeBorder}; letter-spacing: 0.3px;">
                    H-${item.diffDays} · ${styles.label}
                  </span>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <div style="height: 1px; background-color: #232f48; margin: 12px 0;"></div>

            <!-- Row 2: Registrar Pill + Due Date -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align: middle; text-align: left;">
                  <span style="display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; background-color: rgba(255, 255, 255, 0.07); color: #f1f5f9 !important; border: 1px solid ${regColor}60;">
                    <span style="color: ${regColor}; font-size: 12px; margin-right: 4px;">●</span>${regName}
                  </span>
                </td>
                <td style="vertical-align: middle; text-align: right; font-size: 12px; color: #94a3b8 !important;">
                  Jatuh tempo: <strong style="color: #ffffff !important;">${formattedDate}</strong>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  };

  const renderSection = (
    title: string,
    items: DomainAlertItem[],
    tier: "critical" | "urgent" | "warning" | "upcoming"
  ) => {
    if (items.length === 0) return "";
    const styles = getTierStyles(tier);

    return `
      <div style="margin-top: 24px; margin-bottom: 8px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px;">
          <tr>
            <td style="font-size: 13px; font-weight: 800; color: #cbd5e1 !important; text-transform: uppercase; letter-spacing: 0.8px;">
              ${styles.icon} ${title} (${items.length})
            </td>
          </tr>
        </table>
        ${items.map((it) => renderDomainCard(it, tier)).join("")}
      </div>
    `;
  };

  const criticalStyles = getTierStyles("critical");
  const urgentStyles = getTierStyles("urgent");
  const warningStyles = getTierStyles("warning");
  const upcomingStyles = getTierStyles("upcoming");

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="id">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      <title>Domain Expiry Digest - Arvello's Hub</title>
      <style type="text/css">
        :root {
          color-scheme: light dark;
          supported-color-schemes: light dark;
        }
        body, table, td, p, a {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        table, td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 20px 10px; background-color: #0b0f19 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
      
      <!-- Outer Centered Container -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0b0f19;">
        <tr>
          <td align="center">
            
            <!-- Main Email Card (Max 580px) -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #111827; border-radius: 20px; border: 1px solid #1f293d; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
              
              <!-- Header Section -->
              <tr>
                <td style="padding: 28px 24px 22px 24px; background: linear-gradient(180deg, #162035 0%, #111827 100%); border-bottom: 1px solid #1f293d;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #38bdf8 !important;">
                        ARVELLO'S HUB · DOMAINOPS
                      </td>
                      <td style="text-align: right; font-size: 11px; color: #94a3b8 !important; font-weight: 600;">
                        ${nowFormatted}
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top: 14px;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff !important; letter-spacing: -0.5px; line-height: 1.2;">
                          Domain Expiry Digest
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top: 8px;">
                        <p style="margin: 0; font-size: 13px; color: #94a3b8 !important; line-height: 1.5;">
                          Terdapat <strong style="color: #38bdf8 !important;">${totalCount} domain</strong> yang mendekati batas waktu jatuh tempo perpanjangan (H-3, H-7, H-14, H-30).
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding: 24px;">

                  <!-- 4-Column Table-Based KPI Summary Bar (Bulletproof in Mobile Email Clients) -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                    <tr>
                      <!-- Kritis H-3 -->
                      <td width="24%" align="center" style="background-color: ${criticalStyles.kpiBg}; border: 1px solid ${criticalStyles.kpiBorder}; border-radius: 10px; padding: 10px 4px;">
                        <div style="font-size: 20px; font-weight: 900; color: ${criticalStyles.kpiNum} !important; line-height: 1;">
                          ${grouped.critical.length}
                        </div>
                        <div style="font-size: 9px; font-weight: 800; color: ${criticalStyles.kpiText} !important; text-transform: uppercase; margin-top: 5px; letter-spacing: 0.3px;">
                          Sisa 3 Hari
                        </div>
                      </td>

                      <td width="1.3%"></td>

                      <!-- Mendesak H-7 -->
                      <td width="24%" align="center" style="background-color: ${urgentStyles.kpiBg}; border: 1px solid ${urgentStyles.kpiBorder}; border-radius: 10px; padding: 10px 4px;">
                        <div style="font-size: 20px; font-weight: 900; color: ${urgentStyles.kpiNum} !important; line-height: 1;">
                          ${grouped.urgent.length}
                        </div>
                        <div style="font-size: 9px; font-weight: 800; color: ${urgentStyles.kpiText} !important; text-transform: uppercase; margin-top: 5px; letter-spacing: 0.3px;">
                          Sisa 7 Hari
                        </div>
                      </td>

                      <td width="1.3%"></td>

                      <!-- Peringatan H-14 -->
                      <td width="24%" align="center" style="background-color: ${warningStyles.kpiBg}; border: 1px solid ${warningStyles.kpiBorder}; border-radius: 10px; padding: 10px 4px;">
                        <div style="font-size: 20px; font-weight: 900; color: ${warningStyles.kpiNum} !important; line-height: 1;">
                          ${grouped.warning.length}
                        </div>
                        <div style="font-size: 9px; font-weight: 800; color: ${warningStyles.kpiText} !important; text-transform: uppercase; margin-top: 5px; letter-spacing: 0.3px;">
                          Sisa 14 Hari
                        </div>
                      </td>

                      <td width="1.3%"></td>

                      <!-- Pengingat H-30 -->
                      <td width="24%" align="center" style="background-color: ${upcomingStyles.kpiBg}; border: 1px solid ${upcomingStyles.kpiBorder}; border-radius: 10px; padding: 10px 4px;">
                        <div style="font-size: 20px; font-weight: 900; color: ${upcomingStyles.kpiNum} !important; line-height: 1;">
                          ${grouped.upcoming.length}
                        </div>
                        <div style="font-size: 9px; font-weight: 800; color: ${upcomingStyles.kpiText} !important; text-transform: uppercase; margin-top: 5px; letter-spacing: 0.3px;">
                          Sisa 30 Hari
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Group Sections -->
                  ${renderSection("Kritis — Segera Perpanjang", grouped.critical, "critical")}
                  ${renderSection("Mendesak — Sisa Satu Pekan", grouped.urgent, "urgent")}
                  ${renderSection("Peringatan Dua Pekan", grouped.warning, "warning")}
                  ${renderSection("Pengingat Awal Satu Bulan", grouped.upcoming, "upcoming")}

                  <!-- Action CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 28px;">
                    <tr>
                      <td align="center">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="center" style="border-radius: 12px; background-color: #0052cc; box-shadow: 0 4px 12px rgba(0, 82, 204, 0.35);">
                              <a href="${appUrl}/domains" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 800; color: #ffffff !important; text-decoration: none; letter-spacing: 0.2px;">
                                Buka Dashboard Domain &rarr;
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 12px 0 0 0; font-size: 11px; color: #94a3b8 !important;">
                          Kelola DNS, update status registrar, atau perbarui tanggal expire di Command Center.
                        </p>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer Section -->
              <tr>
                <td style="padding: 20px 24px; background-color: #0d131f; border-top: 1px solid #1f293d; text-align: center; font-size: 11px; color: #64748b !important; line-height: 1.5;">
                  Email notifikasi ini dikirim otomatis oleh <strong style="color: #94a3b8 !important;">Arvello's Hub DomainOps Engine</strong>.<br />
                  Diberdayakan oleh Resend &amp; GitHub Actions Cron.
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
}

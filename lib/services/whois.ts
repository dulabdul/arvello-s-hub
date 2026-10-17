import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface WhoisResult {
  domain: string;
  matchedRegistrar: string | null;
  rawRegistrar: string | null;
  expiresAt: string | null;
  createdAt: string | null;
  success: boolean;
  error?: string;
}

const REGISTRAR_MAPPINGS: { pattern: RegExp; name: string }[] = [
  { pattern: /namecheap/i, name: "Namecheap" },
  { pattern: /godaddy/i, name: "GoDaddy" },
  { pattern: /cloudflare/i, name: "Cloudflare" },
  { pattern: /hostinger/i, name: "Hostinger" },
  { pattern: /rumahweb|digital registra/i, name: "RumahWeb" },
  { pattern: /niagahoster|ardh global/i, name: "Niagahoster" },
  { pattern: /domainesia/i, name: "DomaiNesia" },
  { pattern: /porkbun/i, name: "Porkbun" },
  { pattern: /qwords/i, name: "Qwords" },
  { pattern: /dynadot/i, name: "Dynadot" },
  { pattern: /tucows/i, name: "Tucows" },
  { pattern: /gandi/i, name: "Gandi" },
];

/**
 * Perform a WHOIS lookup for a given domain and parse registrar and dates.
 */
export async function lookupWhois(domainName: string): Promise<WhoisResult> {
  const cleanDomain = domainName.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];

  try {
    const { stdout } = await execAsync(`whois ${cleanDomain}`, {
      timeout: 10000,
      maxBuffer: 1024 * 512,
    });

    const raw = stdout;
    const domainSection = raw.includes("Domain Name:") ? raw.slice(raw.indexOf("Domain Name:")) : raw;

    // 1. Expiry Date
    const expiryMatch =
      domainSection.match(
        /(?:Registry Expiry Date|Registrar Registration Expiration Date|Expiration Date|Registry Expiry|paid-till|expire-date|renewal date):\s*([^\r\n]+)/i
      ) ||
      raw.match(
        /(?:Registry Expiry Date|Registrar Registration Expiration Date|Expiration Date|paid-till|expire-date):\s*([^\r\n]+)/i
      );

    let expiresAt: string | null = null;
    if (expiryMatch) {
      const parsed = new Date(expiryMatch[1].trim());
      if (!isNaN(parsed.getTime())) {
        expiresAt = parsed.toISOString();
      }
    }

    // 2. Creation / Register Date
    const creationMatch = domainSection.match(
      /(?:Creation Date|Created Date|Created on|Registration Date|Registration Time):\s*([^\r\n]+)/i
    );

    let createdAt: string | null = null;
    if (creationMatch) {
      const parsed = new Date(creationMatch[1].trim());
      if (!isNaN(parsed.getTime())) {
        createdAt = parsed.toISOString();
      }
    }

    // 3. Registrar
    const regMatch =
      domainSection.match(/(?:Registrar:|Sponsoring Registrar:|Registrar Name:)\s*([^\r\n]+)/i) ||
      raw.match(/(?:Registrar:|Sponsoring Registrar:)\s*([^\r\n]+)/i);

    let rawRegistrar: string | null = regMatch ? regMatch[1].trim() : null;
    let matchedRegistrar: string | null = null;

    if (rawRegistrar) {
      for (const mapping of REGISTRAR_MAPPINGS) {
        if (mapping.pattern.test(rawRegistrar)) {
          matchedRegistrar = mapping.name;
          break;
        }
      }
      if (!matchedRegistrar) {
        // Fallback: clean up raw registrar
        matchedRegistrar = rawRegistrar.replace(/,?\s*(Inc\.|LLC|Ltd\.|GmbH|Operations|UAB).*$/i, "").trim();
      }
    }

    return {
      domain: cleanDomain,
      matchedRegistrar,
      rawRegistrar,
      expiresAt,
      createdAt,
      success: !!(matchedRegistrar || expiresAt),
    };
  } catch (err: any) {
    return {
      domain: cleanDomain,
      matchedRegistrar: null,
      rawRegistrar: null,
      expiresAt: null,
      createdAt: null,
      success: false,
      error: err.message || "Gagal melakukan lookup WHOIS",
    };
  }
}

import { prisma } from "@/lib/db/prisma";
import { decrypt } from "@/lib/services/crypto";

const CF_API_BASE = "https://api.cloudflare.com/client/v4";

export async function getCloudflareAuth() {
  const tokenSetting = await prisma.setting.findUnique({ where: { key: "CLOUDFLARE_API_TOKEN" } });
  const accountSetting = await prisma.setting.findUnique({ where: { key: "CLOUDFLARE_ACCOUNT_ID" } });

  if (!tokenSetting || !accountSetting) {
    throw new Error("Cloudflare credentials not configured in settings.");
  }

  return {
    token: decrypt(tokenSetting.value),
    accountId: decrypt(accountSetting.value),
  };
}

async function fetchCF(endpoint: string, method: string = "GET", body?: any) {
  const { token } = await getCloudflareAuth();
  
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${CF_API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  
  if (!response.ok || !data.success) {
    const errorMsg = data.errors?.[0]?.message || "Cloudflare API Error";
    throw new Error(errorMsg);
  }

  return data.result;
}

// 1. Create Zone (Register Domain to CF)
export async function createZone(domainName: string) {
  const { accountId } = await getCloudflareAuth();
  return fetchCF("/zones", "POST", {
    name: domainName,
    account: { id: accountId },
    jump_start: true,
  });
}

// 2. Get Zone Details (Check Status)
export async function getZone(zoneId: string) {
  return fetchCF(`/zones/${zoneId}`, "GET");
}

// 3. Get DNS Records for Zone
export async function getDnsRecords(zoneId: string) {
  return fetchCF(`/zones/${zoneId}/dns_records`, "GET");
}

// 4. Create DNS Record
export async function createDnsRecord(zoneId: string, record: { type: string; name: string; content: string; proxied?: boolean; ttl?: number }) {
  return fetchCF(`/zones/${zoneId}/dns_records`, "POST", record);
}

// 5. Delete DNS Record
export async function deleteDnsRecord(zoneId: string, recordId: string) {
  return fetchCF(`/zones/${zoneId}/dns_records/${recordId}`, "DELETE");
}

// 6. List all Zones (Handles Pagination)
export async function listZones() {
  const { token, accountId } = await getCloudflareAuth();
  let allZones: any[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones?account.id=${accountId}&per_page=50&page=${page}`, {
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    });
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      throw new Error(data.errors?.[0]?.message || "Cloudflare API Error");
    }

    allZones = allZones.concat(data.result);
    totalPages = data.result_info?.total_pages || 1;
    page++;
  } while (page <= totalPages);

  return allZones;
}

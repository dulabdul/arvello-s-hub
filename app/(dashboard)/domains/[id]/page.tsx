"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/modules/Topbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { ArrowLeft, Trash2, Plus, Loader2, Cloud, CloudOff } from "lucide-react";

interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied: boolean;
  ttl: number;
}

export default function DomainDnsPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.id as string;

  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [domainName, setDomainName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New Record Form State
  const [type, setType] = useState("A");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [proxied, setProxied] = useState(true);

  useEffect(() => {
    fetchData();
  }, [domainId]);

  async function fetchData() {
    try {
      // Get domain details to display name
      const domRes = await fetch("/api/domains");
      const domData = await domRes.json();
      const domain = domData.find((d: any) => d.id === domainId);
      if (domain) setDomainName(domain.name);

      // Get DNS records
      const dnsRes = await fetch(`/api/domains/${domainId}/dns`);
      const dnsData = await dnsRes.json();
      
      if (dnsRes.ok) {
        setRecords(dnsData);
      } else {
        setError(dnsData.error || "Gagal mengambil data DNS");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError("");

    try {
      const payload = { type, name, content, proxied, ttl: 1 }; // 1 = auto
      const res = await fetch(`/api/domains/${domainId}/dns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Gagal menambah record");
      
      // Reset form and refresh
      setType("A");
      setName("");
      setContent("");
      setProxied(true);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Hapus DNS Record ini?")) return;
    setDeletingId(recordId);
    try {
      const res = await fetch(`/api/domains/${domainId}/dns?recordId=${recordId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setRecords(records.filter(r => r.id !== recordId));
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus record");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Pengelolaan DNS"
        subtitle={domainName ? `Domain: ${domainName}` : "Loading..."}
        actions={
          <Button variant="outline" onClick={() => router.push("/domains")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Button>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Tambah DNS Record</h2>
          <form onSubmit={handleAddRecord} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-32">
              <Select
                label="Tipe"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { value: "A", label: "A" },
                  { value: "CNAME", label: "CNAME" },
                  { value: "TXT", label: "TXT" },
                  { value: "MX", label: "MX" }
                ]}
              />
            </div>
            <div className="w-full md:flex-1">
              <Input
                label="Nama (Gunakan @ untuk root)"
                placeholder="@ atau www"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="w-full md:flex-1">
              <Input
                label="Konten / Target IPv4"
                placeholder="192.168.1.1"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <div className="w-full md:w-32 flex items-center h-10 px-2 cursor-pointer" onClick={() => setProxied(!proxied)}>
               <input type="checkbox" checked={proxied} onChange={(e) => setProxied(e.target.checked)} className="mr-2" />
               <label className="text-sm text-slate-600 dark:text-slate-300">Proxied</label>
            </div>
            <Button type="submit" variant="primary" className="w-full md:w-auto" disabled={adding}>
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Tambah</>}
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">DNS Records</h2>
          </div>
          
          {loading ? (
            <div className="p-10 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
          ) : records.length === 0 ? (
            <div className="p-10 text-center text-slate-500">Tidak ada record DNS ditemukan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left font-mono">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Content</th>
                    <th className="px-6 py-3 font-medium">Proxy Status</th>
                    <th className="px-6 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">{record.type}</td>
                      <td className="px-6 py-4 text-slate-900 dark:text-slate-100">{record.name}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-xs" title={record.content}>
                        {record.content}
                      </td>
                      <td className="px-6 py-4">
                        {record.proxied ? (
                          <span className="inline-flex items-center text-amber-500" title="Proxied by Cloudflare">
                            <Cloud className="w-5 h-5 mr-1" /> Proxied
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-400" title="DNS Only">
                            <CloudOff className="w-5 h-5 mr-1" /> DNS Only
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          disabled={deletingId === record.id}
                          className={`p-1.5 text-slate-400 hover:text-rose-500 transition-colors ${deletingId === record.id ? 'opacity-50 cursor-wait' : ''}`}
                          title="Hapus Record"
                        >
                          {deletingId === record.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

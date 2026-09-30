"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/services/invoice/calculator";

export default function PublicProposalPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (token) {
      fetch(`/api/public/proposal/${token}`)
        .then(res => {
          if (!res.ok) throw new Error("Proposal tidak ditemukan atau sudah tidak berlaku.");
          return res.json();
        })
        .then(data => {
          setProposal(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [token]);

  const handleAction = async (action: "ACCEPT" | "REJECT") => {
    if (!confirm(action === "ACCEPT" ? "Anda yakin ingin menerima proposal ini?" : "Anda yakin ingin menolak proposal ini?")) return;
    
    setProcessing(true);
    try {
      const res = await fetch(`/api/public/proposal/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setProposal({ ...proposal, status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED" });
      } else {
        alert("Terjadi kesalahan. Silakan coba lagi.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500 animate-pulse">Memuat Proposal...</div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <XCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Proposal Tidak Ditemukan</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{error}</p>
      </div>
    );
  }

  const clientName = proposal.client ? proposal.client.name : proposal.prospectName;
  const clientCompany = proposal.client?.company ? `(${proposal.client.company})` : "";
  const isActionable = proposal.status !== "ACCEPTED" && proposal.status !== "REJECTED";

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-brand-primary/10 text-brand-primary rounded-2xl mb-6">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-text font-serif mb-3 tracking-tight">{proposal.title}</h1>
        <p className="text-brand-muted">Dipersiapkan untuk: <span className="font-semibold text-brand-text">{clientName} {clientCompany}</span></p>
      </div>

      {/* Status Banner (if already responded) */}
      {!isActionable && (
        <div className={`mb-8 p-4 rounded-xl flex items-center justify-center gap-3 border ${
          proposal.status === "ACCEPTED" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300" 
            : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-300"
        }`}>
          {proposal.status === "ACCEPTED" ? (
            <><CheckCircle2 className="w-5 h-5" /> <span>Anda telah menerima proposal ini. Terima kasih!</span></>
          ) : (
            <><XCircle className="w-5 h-5" /> <span>Anda telah menolak proposal ini.</span></>
          )}
        </div>
      )}

      {/* Content Sections */}
      <div className="space-y-8 mb-12">
        {proposal.content?.map((section: any, idx: number) => (
          <Card key={idx} className="p-8 border-brand-border">
            <h2 className="text-2xl font-bold mb-4 pb-4 border-b border-brand-border text-brand-text font-serif">
              {section.title}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap text-brand-text opacity-90 leading-relaxed">
              {section.body}
            </div>
          </Card>
        ))}

        {/* Pricing Section */}
        <Card className="p-8 border-brand-border">
          <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-brand-border text-brand-text font-serif">
            Estimasi Biaya
          </h2>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-brand-bg/50 p-6 rounded-xl border border-brand-border">
            <div>
              <p className="text-sm text-brand-muted mb-1 font-medium tracking-wide uppercase">Total Nilai Kontrak</p>
              <p className="text-3xl font-bold text-brand-primary">
                {formatCurrency(proposal.total, proposal.currency)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Bar */}
      {isActionable && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-brand-surface/90 backdrop-blur-md border-t border-brand-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 pb-safe">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-brand-muted font-medium">
              Apakah Anda menyetujui penawaran ini?
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none text-brand-danger border-brand-danger/20 hover:bg-brand-danger/10"
                onClick={() => handleAction("REJECT")}
                disabled={processing}
              >
                Tolak
              </Button>
              <Button 
                variant="primary" 
                className="flex-1 sm:flex-none bg-brand-success hover:bg-brand-success/90 text-white"
                onClick={() => handleAction("ACCEPT")}
                disabled={processing}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Terima Proposal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

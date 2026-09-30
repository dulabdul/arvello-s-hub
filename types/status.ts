export type ProjectStatus =
  | "LEAD"
  | "NEGOTIATION"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "CANCELLED";

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "UNPAID"
  | "PAID"
  | "OVERDUE";

export type ContractType = "FIXED" | "HOURLY";

export interface StatusMeta {
  label: string;
  badgeClass: string;
  colorVar: string;
}

export const PROJECT_STATUS_MAP: Record<ProjectStatus, StatusMeta> = {
  LEAD: {
    label: "Lead",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    colorVar: "--color-text-secondary",
  },
  NEGOTIATION: {
    label: "Negosiasi",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    colorVar: "--color-warning",
  },
  IN_PROGRESS: {
    label: "Berjalan",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800",
    colorVar: "--color-primary",
  },
  REVIEW: {
    label: "Review",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
    colorVar: "--color-info",
  },
  COMPLETED: {
    label: "Selesai",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    colorVar: "--color-success",
  },
  CANCELLED: {
    label: "Dibatalkan",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
    colorVar: "--color-danger",
  },
};

export const INVOICE_STATUS_MAP: Record<InvoiceStatus, StatusMeta> = {
  DRAFT: {
    label: "Draft",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    colorVar: "--color-text-secondary",
  },
  SENT: {
    label: "Terkirim",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
    colorVar: "--color-info",
  },
  UNPAID: {
    label: "Belum Dibayar",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    colorVar: "--color-warning",
  },
  PAID: {
    label: "Lunas",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    colorVar: "--color-success",
  },
  OVERDUE: {
    label: "Overdue",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
    colorVar: "--color-danger",
  },
};

export type ProposalStatus = "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED";

export const PROPOSAL_STATUS_MAP: Record<ProposalStatus, StatusMeta> = {
  DRAFT: {
    label: "Draft",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    colorVar: "--color-text-secondary",
  },
  SENT: {
    label: "Dikirim",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
    colorVar: "--color-info",
  },
  VIEWED: {
    label: "Dilihat",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    colorVar: "--color-warning",
  },
  ACCEPTED: {
    label: "Diterima",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    colorVar: "--color-success",
  },
  REJECTED: {
    label: "Ditolak",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
    colorVar: "--color-danger",
  },
};

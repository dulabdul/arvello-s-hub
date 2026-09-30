import { ProjectStatus, InvoiceStatus, ContractType } from "@/types/status";
import { InvoiceItem } from "@/lib/services/invoice/calculator";

export interface ClientData {
  id: string;
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface ProjectData {
  id: string;
  clientId: string;
  clientName: string;
  clientCompany?: string | null;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  contractType: ContractType;
  value: number;
  startDate?: string | null;
  deadline?: string | null;
  createdAt: string;
}

export interface InvoiceData {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientCompany?: string | null;
  clientEmail: string;
  projectId: string;
  projectName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string | null;
  createdAt: string;
}

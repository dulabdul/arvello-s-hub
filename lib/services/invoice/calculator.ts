export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
}

export function calculateTotal(subtotal: number, tax: number = 0, discount: number = 0): number {
  return Math.max(0, subtotal + tax - discount);
}

export function formatCurrency(amount: number, currency: string = "IDR"): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

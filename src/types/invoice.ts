export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  taxRate: number; // percentage, e.g. 10 for 10%
}

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-04910
  customerId: string;
  customerName: string;
  customerEmail: string;
  currency?: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string;     // YYYY-MM-DD
  items: InvoiceItem[];
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFormData {
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  currency?: string;
  items: {
    id?: string;
    name: string;
    description?: string;
    quantity: number;
    price: number;
    taxRate: number;
  }[];
  notes?: string;
}

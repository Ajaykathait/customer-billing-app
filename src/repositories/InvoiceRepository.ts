import type { IRepository } from './IRepository';
import type { Invoice, InvoiceStatus } from '../types/invoice';
import { storageService } from '../services/StorageService';

/**
 * InvoiceRepository handles data access for Invoice records.
 */
export class InvoiceRepository implements IRepository<Invoice> {
  private store: LocalForage;

  constructor() {
    this.store = storageService.invoiceStore;
  }

  async getAll(): Promise<Invoice[]> {
    const invoices: Invoice[] = [];
    await this.store.iterate<Invoice, void>((value) => {
      if (value && value.id) {
        invoices.push(value);
      }
    });
    // Default sort by invoiceDate or createdAt descending
    return invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getById(id: string): Promise<Invoice | null> {
    const invoice = await this.store.getItem<Invoice>(id);
    return invoice || null;
  }

  async create(invoice: Invoice): Promise<Invoice> {
    const record: Invoice = {
      ...invoice,
      createdAt: invoice.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.store.setItem(record.id, record);
    return record;
  }

  async update(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Invoice with id ${id} not found`);
    }
    const updated: Invoice = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    await this.store.setItem(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) return false;
    await this.store.removeItem(id);
    return true;
  }

  async find(predicate: (item: Invoice) => boolean): Promise<Invoice[]> {
    const all = await this.getAll();
    return all.filter(predicate);
  }

  async findByCustomerId(customerId: string): Promise<Invoice[]> {
    const all = await this.getAll();
    return all.filter((inv) => inv.customerId === customerId);
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    return this.update(id, { status });
  }

  async getNextInvoiceNumber(): Promise<string> {
    const all = await this.getAll();
    const nextNum = all.length + 1;
    return `INV-${String(nextNum).padStart(5, '0')}`;
  }
}

export const invoiceRepository = new InvoiceRepository();

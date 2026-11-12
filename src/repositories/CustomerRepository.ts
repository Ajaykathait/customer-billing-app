import type { IRepository } from './IRepository';
import type { Customer } from '../types/customer';
import { storageService } from '../services/StorageService';

/**
 * CustomerRepository handles data access for Customer records.
 */
export class CustomerRepository implements IRepository<Customer> {
  private store: LocalForage;

  constructor() {
    this.store = storageService.customerStore;
  }

  async getAll(): Promise<Customer[]> {
    const customers: Customer[] = [];
    await this.store.iterate<Customer, void>((value) => {
      if (value && value.id) {
        customers.push(value);
      }
    });
    // Default sort by createdAt descending
    return customers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getById(id: string): Promise<Customer | null> {
    const customer = await this.store.getItem<Customer>(id);
    return customer || null;
  }

  async create(customer: Customer): Promise<Customer> {
    const record: Customer = {
      ...customer,
      createdAt: customer.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.store.setItem(record.id, record);
    return record;
  }

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Customer with id ${id} not found`);
    }
    const updated: Customer = {
      ...existing,
      ...updates,
      id, // ensure ID cannot be altered
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

  async find(predicate: (item: Customer) => boolean): Promise<Customer[]> {
    const all = await this.getAll();
    return all.filter(predicate);
  }

  /**
   * Specifically used for async validation in Zod multi-step form:
   * Checks if an email already exists in IndexedDB.
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    if (!email) return false;
    const normalized = email.trim().toLowerCase();
    const all = await this.getAll();
    return all.some((c) => c.email.trim().toLowerCase() === normalized && c.id !== excludeId);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const normalized = email.trim().toLowerCase();
    const all = await this.getAll();
    return all.find((c) => c.email.trim().toLowerCase() === normalized) || null;
  }
}

export const customerRepository = new CustomerRepository();

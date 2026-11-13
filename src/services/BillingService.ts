import { customerRepository } from '../repositories/CustomerRepository';
import { invoiceRepository } from '../repositories/InvoiceRepository';
import type { Customer, CustomerFormData } from '../types/customer';
import type { Invoice, InvoiceFormData, InvoiceStatus } from '../types/invoice';

/**
 * BillingService handles invoice calculations and customer-invoice operations.
 */
export class BillingService {
  /**
   * Calculate invoice financial totals accurately
   */
  calculateTotals(items: { quantity: number; price: number; taxRate: number }[]) {
    const subtotal = items.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.price) || 0;
      return sum + q * p;
    }, 0);

    const totalTax = items.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.price) || 0;
      const t = Number(item.taxRate) || 0;
      return sum + (q * p * (t / 100));
    }, 0);

    const grandTotal = subtotal + totalTax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
    };
  }

  /**
   * Create a new customer
   */
  async createCustomer(data: CustomerFormData): Promise<Customer> {
    const id = 'cust_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const newCustomer: Customer = {
      ...data,
      id,
      // If shippingSameAsBilling is true, ensure shipping address mirrors billing address
      shippingAddress: data.shippingSameAsBilling ? { ...data.billingAddress } : data.shippingAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return customerRepository.create(newCustomer);
  }

  /**
   * Create an invoice linked to a customer
   */
  async createInvoice(data: InvoiceFormData): Promise<Invoice> {
    const customer = await customerRepository.getById(data.customerId);
    if (!customer) {
      throw new Error('Selected customer not found.');
    }

    const { subtotal, totalTax, grandTotal } = this.calculateTotals(data.items);
    const invoiceNumber = await invoiceRepository.getNextInvoiceNumber();
    const id = 'inv_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    const invoiceItems = data.items.map((item, idx) => ({
      id: item.id || `item_${idx}_${Date.now()}`,
      name: item.name,
      description: item.description || '',
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
      taxRate: Number(item.taxRate) || 0,
    }));

    // Determine initial status based on due date
    const today = new Date().toISOString().split('T')[0];
    const isOverdue = data.dueDate < today;
    const initialStatus: InvoiceStatus = isOverdue ? 'overdue' : 'unpaid';

    const newInvoice: Invoice = {
      id,
      invoiceNumber,
      customerId: customer.id,
      customerName: customer.company ? `${customer.company} (${customer.name})` : customer.name,
      customerEmail: customer.email,
      currency: data.currency || customer.currency || 'INR',
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      items: invoiceItems,
      subtotal,
      totalTax,
      grandTotal,
      status: initialStatus,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return invoiceRepository.create(newInvoice);
  }

  /**
   * Get customer summary including invoice count and balance
   */
  async getCustomerWithStats(customerId: string) {
    const customer = await customerRepository.getById(customerId);
    if (!customer) return null;

    const invoices = await invoiceRepository.findByCustomerId(customerId);
    const totalInvoices = invoices.length;
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((sum, inv) => sum + inv.grandTotal, 0);
    const balanceDue = totalBilled - totalPaid;

    return {
      customer,
      invoices,
      totalInvoices,
      totalBilled,
      totalPaid,
      balanceDue,
    };
  }

  /**
   * Delete customer and check for attached invoices
   */
  async deleteCustomer(customerId: string, cascadeInvoices = false): Promise<{ success: boolean; invoiceCount: number }> {
    const customerInvoices = await invoiceRepository.findByCustomerId(customerId);
    if (customerInvoices.length > 0 && !cascadeInvoices) {
      return { success: false, invoiceCount: customerInvoices.length };
    }

    if (cascadeInvoices) {
      for (const inv of customerInvoices) {
        await invoiceRepository.delete(inv.id);
      }
    }

    const deleted = await customerRepository.delete(customerId);
    return { success: deleted, invoiceCount: customerInvoices.length };
  }
}

export const billingService = new BillingService();

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Invoice, InvoiceFormData, InvoiceStatus } from '../types/invoice';
import { invoiceRepository } from '../repositories/InvoiceRepository';
import { billingService } from '../services/BillingService';

export function useInvoices(initialCustomerId?: string) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomerId || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchInvoices = useCallback(async () => {
    try {
      const list = await invoiceRepository.getAll();
      setInvoices(list);
      setError(null);
    } catch (err) {
      console.error('Failed to load invoices from IndexedDB:', err);
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const list = await invoiceRepository.getAll();
        if (!ignore) {
          setInvoices(list);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    if (selectedCustomerId) {
      result = result.filter((inv) => inv.customerId === selectedCustomerId);
    }

    if (statusFilter !== 'all') {
      result = result.filter((inv) => inv.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q) ||
          inv.customerEmail.toLowerCase().includes(q)
      );
    }

    return result;
  }, [invoices, selectedCustomerId, statusFilter, searchQuery]);

  const addInvoice = async (data: InvoiceFormData): Promise<Invoice> => {
    const created = await billingService.createInvoice(data);
    await fetchInvoices();
    return created;
  };

  const toggleInvoiceStatus = async (id: string): Promise<Invoice> => {
    const existing = await invoiceRepository.getById(id);
    if (!existing) throw new Error('Invoice not found');
    const newStatus: InvoiceStatus = existing.status === 'paid' ? 'unpaid' : 'paid';
    const updated = await invoiceRepository.updateStatus(id, newStatus);
    await fetchInvoices();
    return updated;
  };

  const deleteInvoice = async (id: string): Promise<boolean> => {
    const deleted = await invoiceRepository.delete(id);
    if (deleted) {
      await fetchInvoices();
    }
    return deleted;
  };

  return {
    invoices,
    filteredInvoices,
    loading,
    error,
    selectedCustomerId,
    setSelectedCustomerId,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    refresh: fetchInvoices,
    addInvoice,
    toggleInvoiceStatus,
    deleteInvoice,
  };
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Customer, CustomerFormData } from '../types/customer';
import { customerRepository } from '../repositories/CustomerRepository';
import { billingService } from '../services/BillingService';

export type CustomerSortField = 'name' | 'company' | 'createdAt' | 'email';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<CustomerSortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const fetchCustomers = useCallback(async () => {
    try {
      const list = await customerRepository.getAll();
      setCustomers(list);
      setError(null);
    } catch (err) {
      console.error('Failed to load customers from IndexedDB:', err);
      setError('Failed to load customers from IndexedDB');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      const list = await customerRepository.getAll();
      if (!ignore) {
        setCustomers(list);
        setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Filtered and sorted customers
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          c.billingAddress?.city?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = '';
      let valB = '';

      switch (sortField) {
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'company':
          valA = (a.company || '').toLowerCase();
          valB = (b.company || '').toLowerCase();
          break;
        case 'email':
          valA = a.email.toLowerCase();
          valB = b.email.toLowerCase();
          break;
        case 'createdAt':
        default:
          valA = a.createdAt;
          valB = b.createdAt;
          break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [customers, searchQuery, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Paginated subset
  const paginatedCustomers = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, safeCurrentPage, pageSize]);

  const addCustomer = async (data: CustomerFormData): Promise<Customer> => {
    const created = await billingService.createCustomer(data);
    await fetchCustomers();
    return created;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    const updated = await customerRepository.update(id, updates);
    await fetchCustomers();
    return updated;
  };

  const deleteCustomer = async (id: string, cascade = false): Promise<{ success: boolean; invoiceCount: number }> => {
    const res = await billingService.deleteCustomer(id, cascade);
    if (res.success) {
      await fetchCustomers();
    }
    return res;
  };

  return {
    customers,
    filteredCustomers,
    paginatedCustomers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    currentPage: safeCurrentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    refresh: fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  };
}

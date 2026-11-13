import React, { useState } from 'react';
import type { Customer } from '../../types/customer';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../utils/formatters';
import {
  Search,
  UserPlus,
  ArrowUpDown,
  Eye,
  Trash2,
  Receipt,
  Building2,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import type { CustomerSortField } from '../../hooks/useCustomers';

interface CustomerListProps {
  customers: Customer[];
  paginatedCustomers: Customer[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortField: CustomerSortField;
  setSortField: (field: CustomerSortField) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (dir: 'asc' | 'desc') => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  onOpenCreateModal: () => void;
  onSelectCustomerToView: (customer: Customer) => void;
  onCreateInvoiceForCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string, cascade?: boolean) => Promise<{ success: boolean; invoiceCount: number }>;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  paginatedCustomers,
  searchQuery,
  setSearchQuery,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalPages,
  onOpenCreateModal,
  onSelectCustomerToView,
  onCreateInvoiceForCustomer,
  onDeleteCustomer,
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    customer: Customer;
    invoiceCount?: number;
  } | null>(null);

  const toggleSort = (field: CustomerSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleInitiateDelete = async (customer: Customer) => {
    const res = await onDeleteCustomer(customer.id, false);
    if (!res.success && res.invoiceCount > 0) {
      // Customer has active invoices, show cascade confirmation
      setDeleteConfirmation({
        customer,
        invoiceCount: res.invoiceCount,
      });
    }
  };

  const handleConfirmCascadeDelete = async () => {
    if (deleteConfirmation) {
      await onDeleteCustomer(deleteConfirmation.customer.id, true);
      setDeleteConfirmation(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Search, Filters, and New Customer Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, company, email, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-sm text-slate-900 bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Selection */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Sort:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as CustomerSortField)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Customer Name</option>
              <option value="company">Company</option>
              <option value="email">Email</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="ml-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              title="Toggle ascending / descending"
            >
              {sortDirection === 'asc' ? '↑ ASC' : '↓ DESC'}
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={onOpenCreateModal}
          >
            New Customer
          </Button>
        </div>
      </div>

      {/* Customer Listing Table */}
      <Card className="p-0!">
        {paginatedCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No customers found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No customers matched "${searchQuery}". Try adjusting your search query.`
                : 'No customers added yet. Click below to add your first customer.'}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={onOpenCreateModal}
                icon={<UserPlus className="w-3.5 h-3.5" />}
              >
                Create First Customer
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th
                    className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Customer</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Terms</th>
                  <th
                    className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => toggleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Created</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Customer & Company */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {customer.name}
                      </div>
                      {customer.company && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{customer.company}</span>
                        </div>
                      )}
                    </td>

                    {/* Contact (Email & Phone) */}
                    <td className="px-6 py-4 text-xs text-slate-600 space-y-1">
                      {customer.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{customer.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No email</span>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div>
                        {customer.billingAddress.city}, {customer.billingAddress.state}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {customer.billingAddress.country}
                      </div>
                    </td>

                    {/* Terms */}
                    <td className="px-6 py-4">
                      <Badge variant="neutral" size="sm" dot={false}>
                        {customer.paymentTerms ? customer.paymentTerms.replace('_', ' ') : 'Net 30'}
                      </Badge>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(customer.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Create invoice for this customer"
                          onClick={() => onCreateInvoiceForCustomer(customer)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Receipt className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View customer details"
                          onClick={() => onSelectCustomerToView(customer)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete customer"
                          onClick={() => handleInitiateDelete(customer)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {customers.length > 0 && (
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>Showing</span>
              <span className="font-semibold text-slate-800">
                {paginatedCustomers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
              </span>
              <span>to</span>
              <span className="font-semibold text-slate-800">
                {Math.min(currentPage * pageSize, customers.length)}
              </span>
              <span>of</span>
              <span className="font-semibold text-slate-800">{customers.length}</span>
              <span>customers</span>

              <span className="mx-2 text-slate-300">|</span>
              <span>Page size:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-2.5 py-1 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="px-2 text-xs font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-2.5 py-1 text-xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Cascade Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-base">Delete Customer & Invoices</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              <strong>{deleteConfirmation.customer.name}</strong> currently has{' '}
              <span className="font-bold text-slate-900">{deleteConfirmation.invoiceCount}</span> billing
              invoice(s) recorded for this customer. Deleting this customer will also delete all associated invoices.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirmation(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmCascadeDelete}
              >
                Delete Customer & All Invoices
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

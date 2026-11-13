import React from 'react';
import type { Invoice } from '../../types/invoice';
import type { Customer } from '../../types/customer';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  FileText,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';

interface InvoiceListTableProps {
  invoices: Invoice[];
  customers: Customer[];
  selectedCustomerId: string;
  onSelectCustomerId: (id: string) => void;
  statusFilter: string;
  onSelectStatusFilter: (status: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleStatus: (id: string) => Promise<unknown>;
  onDeleteInvoice: (id: string) => Promise<unknown>;
  onViewInvoice: (invoice: Invoice) => void;
}

export const InvoiceListTable: React.FC<InvoiceListTableProps> = ({
  invoices,
  customers,
  selectedCustomerId,
  onSelectCustomerId,
  statusFilter,
  onSelectStatusFilter,
  searchQuery,
  onSearchChange,
  onToggleStatus,
  onDeleteInvoice,
  onViewInvoice,
}) => {
  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Invoices</h3>
          <p className="text-xs text-slate-500">
            View and manage all generated invoices
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Customer filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Customer:</span>
            <select
              value={selectedCustomerId}
              onChange={(e) => onSelectCustomerId(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company || c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter buttons */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
            {['all', 'paid', 'unpaid'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onSelectStatusFilter(status)}
                className={`px-2.5 py-1 rounded-md capitalize cursor-pointer transition-colors ${
                  statusFilter === status
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs text-slate-900 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <Card className="p-0! overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">No invoices found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {selectedCustomerId || statusFilter !== 'all' || searchQuery
                ? 'No invoices match the selected filter criteria.'
                : 'Create your first invoice above to see it appear in this list.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Invoice #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Total</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {invoices.map((invoice) => {
                  const isPaid = invoice.status === 'paid';
                  const isOverdue = invoice.status === 'overdue';

                  return (
                    <tr
                      key={invoice.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* INVOICE # (e.g. INV-04910) */}
                      <td className="px-6 py-4 font-mono font-medium text-blue-600 text-xs">
                        {invoice.invoiceNumber}
                      </td>

                      {/* CUSTOMER (e.g. Globex Inc) */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-xs">
                          {invoice.customerName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {invoice.customerEmail}
                        </div>
                      </td>

                      {/* DATE (e.g. 21/06/2025) */}
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <div>{formatDate(invoice.invoiceDate)}</div>
                        <div className="text-[11px] text-slate-400">
                          Due: {formatDate(invoice.dueDate)}
                        </div>
                      </td>

                      {/* TOTAL */}
                      <td className="px-6 py-4 text-xs font-bold text-slate-900">
                        {formatCurrency(invoice.grandTotal, invoice.currency)}
                      </td>

                      {/* STATUS (Paid / Unpaid) */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(invoice.id)}
                          title="Click to toggle Paid / Unpaid status"
                          className="cursor-pointer transition-transform active:scale-95 text-left"
                        >
                          <Badge
                            variant={isPaid ? 'success' : isOverdue ? 'danger' : 'warning'}
                            size="sm"
                          >
                            {invoice.status}
                          </Badge>
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Toggle Status */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title={isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                            onClick={() => onToggleStatus(invoice.id)}
                            className={isPaid ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}
                          >
                            {isPaid ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>

                          {/* View Invoice */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View Invoice Details & Print"
                            onClick={() => onViewInvoice(invoice)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {/* Delete Invoice */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete invoice"
                            onClick={() => onDeleteInvoice(invoice.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

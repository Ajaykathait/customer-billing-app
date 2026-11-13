import React, { useEffect, useState } from 'react';
import type { Customer } from '../../types/customer';
import type { Invoice } from '../../types/invoice';
import { billingService } from '../../services/BillingService';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Building2, Mail, Phone, MapPin, Receipt } from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateInvoiceForCustomer?: (customer: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  isOpen,
  onClose,
  onCreateInvoiceForCustomer,
}) => {
  const [stats, setStats] = useState<{
    invoices: Invoice[];
    totalBilled: number;
    totalPaid: number;
    balanceDue: number;
  } | null>(null);

  useEffect(() => {
    if (customer && isOpen) {
      billingService.getCustomerWithStats(customer.id).then((data) => {
        if (data) {
          setStats({
            invoices: data.invoices,
            totalBilled: data.totalBilled,
            totalPaid: data.totalPaid,
            balanceDue: data.balanceDue,
          });
        }
      });
    }
  }, [customer, isOpen]);

  if (!customer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Customer Profile</span>
          <Badge variant="info" size="sm">
            ID: {customer.id.substring(0, 10)}...
          </Badge>
        </div>
      }
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{customer.name}</h2>
            {customer.company && (
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer.company}</span>
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Customer since {formatDate(customer.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onCreateInvoiceForCustomer && (
              <Button
                variant="primary"
                size="sm"
                icon={<Receipt className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  onCreateInvoiceForCustomer(customer);
                }}
              >
                Create Invoice
              </Button>
            )}
          </div>
        </div>

        {/* Financial Stat Cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-lg text-center">
              <span className="text-[11px] font-medium text-blue-700 block uppercase tracking-wider">
                Total Billed
              </span>
              <span className="text-base font-bold text-blue-900">
                {formatCurrency(stats.totalBilled, customer.currency)}
              </span>
            </div>
            <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-center">
              <span className="text-[11px] font-medium text-emerald-700 block uppercase tracking-wider">
                Total Paid
              </span>
              <span className="text-base font-bold text-emerald-900">
                {formatCurrency(stats.totalPaid, customer.currency)}
              </span>
            </div>
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg text-center">
              <span className="text-[11px] font-medium text-amber-700 block uppercase tracking-wider">
                Balance Due
              </span>
              <span className="text-base font-bold text-amber-900">
                {formatCurrency(stats.balanceDue, customer.currency)}
              </span>
            </div>
          </div>
        )}

        {/* Contact and Account Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Contact Details
            </h4>
            <div className="text-xs flex items-center gap-2 text-slate-700">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{customer.email || 'No email registered'}</span>
            </div>
            <div className="text-xs flex items-center gap-2 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{customer.phone || 'No phone registered'}</span>
            </div>
          </div>

          <div className="p-3.5 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Account & Terms
            </h4>
            <div className="text-xs text-slate-700 flex justify-between">
              <span className="text-slate-500">Terms:</span>
              <span className="font-semibold uppercase">
                {customer.paymentTerms ? customer.paymentTerms.replace('_', ' ') : 'NET 30'}
              </span>
            </div>
            <div className="text-xs text-slate-700 flex justify-between">
              <span className="text-slate-500">Currency:</span>
              <span className="font-semibold">{customer.currency || 'INR'}</span>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> Billing Address
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {customer.billingAddress.street}
              <br />
              {customer.billingAddress.city}, {customer.billingAddress.state}{' '}
              {customer.billingAddress.postalCode}
              <br />
              {customer.billingAddress.country}
            </p>
          </div>

          <div className="p-3.5 border border-slate-200 rounded-xl">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Shipping Address
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {customer.shippingSameAsBilling ? (
                <span className="text-slate-500 italic">Same as billing address</span>
              ) : (
                <>
                  {customer.shippingAddress.street}
                  <br />
                  {customer.shippingAddress.city}, {customer.shippingAddress.state}{' '}
                  {customer.shippingAddress.postalCode}
                  <br />
                  {customer.shippingAddress.country}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Invoices List */}
        {stats && stats.invoices.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-500" /> Customer Invoices ({stats.invoices.length})
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-slate-500">Invoice #</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-500">Date</th>
                    <th className="px-3 py-2 text-right font-medium text-slate-500">Amount</th>
                    <th className="px-3 py-2 text-right font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {stats.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-3 py-2 font-mono font-medium text-blue-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{formatDate(inv.invoiceDate)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900">
                        {formatCurrency(inv.grandTotal, customer.currency || inv.currency)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Badge
                          variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : 'warning'}
                          size="sm"
                        >
                          {inv.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

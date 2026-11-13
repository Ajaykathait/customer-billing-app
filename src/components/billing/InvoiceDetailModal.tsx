import React from 'react';
import type { Invoice } from '../../types/invoice';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Printer, CheckCircle, XCircle } from 'lucide-react';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (id: string) => Promise<unknown>;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onToggleStatus,
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.status === 'paid';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-blue-600">
            {invoice.invoiceNumber}
          </span>
          <Badge
            variant={isPaid ? 'success' : invoice.status === 'overdue' ? 'danger' : 'warning'}
            size="sm"
          >
            {invoice.status}
          </Badge>
        </div>
      }
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Invoice Meta Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Billed To
            </div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {invoice.customerName}
            </div>
            <div className="text-xs text-slate-500">{invoice.customerEmail}</div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-500">Invoice Date:</span>{' '}
              {formatDate(invoice.invoiceDate)}
            </div>
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-500">Due Date:</span>{' '}
              {formatDate(invoice.dueDate)}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Item Description</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Tax (%)</th>
                <th className="px-4 py-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {invoice.items.map((item, i) => {
                const lineTotal = item.quantity * item.price;
                return (
                  <tr key={item.id || i}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {item.name}
                      {item.description && (
                        <div className="text-[11px] text-slate-400 font-normal">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(item.price, invoice.currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{item.taxRate}%</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(lineTotal, invoice.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculation Totals */}
        <div className="flex justify-end">
          <div className="w-full sm:w-64 space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(invoice.subtotal, invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Tax:</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(invoice.totalTax, invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Grand Total:</span>
              <span className="text-blue-600">{formatCurrency(invoice.grandTotal, invoice.currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-amber-900">
            <span className="font-semibold block mb-0.5">Notes:</span>
            {invoice.notes}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(invoice.id)}
            icon={isPaid ? <XCircle className="w-3.5 h-3.5 text-amber-600" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
          >
            {isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5" />}
              onClick={handlePrint}
            >
              Print / Save PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CustomerFormData } from '../../types/customer';
import { FileCheck } from 'lucide-react';

interface Step3Props {
  form: UseFormReturn<CustomerFormData>;
}

export const Step3AccountReview: React.FC<Step3Props> = ({ form }) => {
  const { register, watch } = form;
  const formData = watch();

  return (
    <div className="space-y-5">
      {/* Payment & Terms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Payment Terms
          </label>
          <select
            {...register('paymentTerms')}
            className="block w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          >
            <option value="net_30">Net 30 Days (Standard)</option>
            <option value="net_15">Net 15 Days</option>
            <option value="net_60">Net 60 Days</option>
            <option value="due_on_receipt">Due on Receipt</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Currency
          </label>
          <select
            {...register('currency')}
            className="block w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          >
            <option value="INR">INR (₹) - Indian Rupee</option>
            <option value="USD">USD ($) - US Dollar</option>
            <option value="EUR">EUR (€) - Euro</option>
            <option value="GBP">GBP (£) - British Pound</option>
            <option value="CAD">CAD ($) - Canadian Dollar</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Additional notes or billing instructions..."
            {...register('notes')}
            className="block w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Review Summary */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 mb-2.5 text-slate-800 font-semibold text-xs uppercase tracking-wider">
          <FileCheck className="w-4 h-4 text-slate-500" />
          <span>Review Summary</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div>
            <span className="text-slate-400">Customer:</span>{' '}
            <span className="font-medium text-slate-800">{formData.name || '—'}</span>
            {formData.company && <span className="text-slate-500"> ({formData.company})</span>}
          </div>
          <div>
            <span className="text-slate-400">Contact:</span>{' '}
            <span className="font-medium text-slate-800">{formData.email || formData.phone || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400">Terms:</span>{' '}
            <span className="font-medium text-slate-800 uppercase">
              {formData.paymentTerms?.replace('_', ' ') || 'NET 30'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Currency:</span>{' '}
            <span className="font-medium text-slate-800">{formData.currency || 'USD'}</span>
          </div>
          <div className="sm:col-span-2 pt-1 border-t border-slate-200/60">
            <span className="text-slate-400">Billing Address:</span>{' '}
            <span className="text-slate-700">
              {formData.billingAddress?.street
                ? `${formData.billingAddress.street}, ${formData.billingAddress.city}, ${formData.billingAddress.state} ${formData.billingAddress.postalCode}`
                : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

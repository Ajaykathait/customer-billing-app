import React, { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceSchema, type InvoiceSchemaType } from '../../schemas/invoiceSchema';
import type { Customer } from '../../types/customer';
import type { InvoiceFormData } from '../../types/invoice';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { formatCurrency, getTodayDateString, addDaysToDate } from '../../utils/formatters';
import { Plus, Trash2 } from 'lucide-react';

interface InvoiceCreationFormProps {
  customers: Customer[];
  preselectedCustomerId?: string;
  onInvoiceCreated: (data: InvoiceFormData) => Promise<unknown>;
  onNavigateToCustomerCreation?: () => void;
}

export const InvoiceCreationForm: React.FC<InvoiceCreationFormProps> = ({
  customers,
  preselectedCustomerId,
  onInvoiceCreated,
  onNavigateToCustomerCreation,
}) => {
  const today = getTodayDateString();
  const defaultDue = addDaysToDate(today, 7);

  const form = useForm<InvoiceSchemaType>({
    resolver: zodResolver(invoiceSchema) as Resolver<InvoiceSchemaType>,
    defaultValues: {
      customerId: preselectedCustomerId || (customers[0]?.id ?? ''),
      invoiceDate: today,
      dueDate: defaultDue,
      items: [
        {
          name: '',
          quantity: 1,
          price: 0,
          taxRate: 10,
        },
      ],
      notes: '',
    },
    mode: 'onTouched',
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const selectedCustomerId = useWatch({ control, name: 'customerId' });
  const invoiceDateValue = useWatch({ control, name: 'invoiceDate' });
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const currentCurrency = selectedCustomer?.currency || 'INR';
  const currencySymbol =
    currentCurrency === 'INR' ? '₹' : currentCurrency === 'EUR' ? '€' : currentCurrency === 'GBP' ? '£' : '$';

  useEffect(() => {
    if (preselectedCustomerId) {
      setValue('customerId', preselectedCustomerId);
    }
  }, [preselectedCustomerId, setValue]);

  useEffect(() => {
    if (!selectedCustomerId) return;
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (!cust) return;

    let daysToAdd = 7;
    if (cust.paymentTerms === 'due_on_receipt') daysToAdd = 0;
    else if (cust.paymentTerms === 'net_15') daysToAdd = 15;
    else if (cust.paymentTerms === 'net_30') daysToAdd = 30;
    else if (cust.paymentTerms === 'net_60') daysToAdd = 60;

    const baseDate = invoiceDateValue || today;
    setValue('dueDate', addDaysToDate(baseDate, daysToAdd));
  }, [selectedCustomerId, invoiceDateValue, customers, setValue, today]);

  const watchedItems = useWatch({ control, name: 'items' });
  const calculations = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;

    if (Array.isArray(watchedItems)) {
      for (const item of watchedItems) {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const taxRate = Number(item.taxRate) || 0;

        const lineSubtotal = qty * price;
        const lineTax = lineSubtotal * (taxRate / 100);

        subtotal += lineSubtotal;
        totalTax += lineTax;
      }
    }

    const grandTotal = subtotal + totalTax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
    };
  }, [watchedItems]);

  const onSubmit = async (data: InvoiceSchemaType) => {
    await onInvoiceCreated({
      ...data,
      currency: currentCurrency,
    } as InvoiceFormData);
    reset({
      customerId: data.customerId,
      invoiceDate: today,
      dueDate: addDaysToDate(today, 7),
      items: [
        {
          name: '',
          quantity: 1,
          price: 0,
          taxRate: 10,
        },
      ],
      notes: '',
    });
  };

  const handleAddItem = () => {
    append({
      name: '',
      quantity: 1,
      price: 0,
      taxRate: 10,
    });
  };

  return (
    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create New Invoice</h2>
        <p className="text-xs text-slate-500 mt-1">
          Generate an invoice linked to a customer with automatic tax and total calculation.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Customer <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              {...register('customerId')}
              className={`block w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border rounded-lg focus:outline-none focus:ring-2 ${errors.customerId
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                }`}
            >
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company ? `${c.company} (${c.email || c.name})` : `${c.name} (${c.email || c.phone})`}
                </option>
              ))}
            </select>

            {onNavigateToCustomerCreation && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onNavigateToCustomerCreation}
                icon={<Plus className="w-3.5 h-3.5" />}
                className="shrink-0 text-xs"
              >
                New Customer
              </Button>
            )}
          </div>
          {errors.customerId && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.customerId.message}</p>
          )}
          {!errors.customerId && customers.length === 0 && (
            <p className="mt-1.5 text-xs text-amber-600 font-medium">
              No customers found. Click <strong>New Customer</strong> to add your first customer.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Invoice Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                {...register('invoiceDate')}
                className={`block w-full px-3.5 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:outline-none focus:ring-2 ${errors.invoiceDate
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                  }`}
              />
            </div>
            {errors.invoiceDate && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.invoiceDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Due Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                {...register('dueDate')}
                className={`block w-full px-3.5 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:outline-none focus:ring-2 ${errors.dueDate
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                  }`}
              />
            </div>
            {errors.dueDate && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.dueDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800">Items</h3>
            {errors.items?.root && (
              <p className="text-xs text-red-600 font-medium">{errors.items.root.message}</p>
            )}
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => {
              const itemError = errors.items?.[index];
              const currentItem = watchedItems?.[index];
              const qty = Number(currentItem?.quantity) || 0;
              const price = Number(currentItem?.price) || 0;
              const taxRate = Number(currentItem?.taxRate) || 0;
              const lineSubtotal = qty * price;
              const lineTax = lineSubtotal * (taxRate / 100);
              const lineTotal = lineSubtotal + lineTax;

              return (
                <div
                  key={field.id}
                  className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/90 transition-all hover:border-slate-300"
                >
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200/60">
                    <span className="text-xs font-semibold text-slate-700">Item #{index + 1}</span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer font-medium hover:bg-red-50 px-2 py-0.5 rounded transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-12 sm:col-span-4">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Item Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Service or product name"
                        {...register(`items.${index}.name` as const)}
                        className={`block w-full px-3 py-1.5 text-sm text-slate-900 bg-white border rounded-lg focus:outline-none focus:ring-2 ${itemError?.name
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                          }`}
                      />
                      {itemError?.name && (
                        <p className="mt-1 text-[11px] text-red-600">{itemError.name.message}</p>
                      )}
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Qty <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="1"
                        {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                        className={`block w-full px-3 py-1.5 text-sm text-slate-900 bg-white border rounded-lg focus:outline-none focus:ring-2 ${itemError?.quantity
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                          }`}
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Price per item ({currencySymbol}) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...register(`items.${index}.price` as const, { valueAsNumber: true })}
                        className={`block w-full px-3 py-1.5 text-sm text-slate-900 bg-white border rounded-lg focus:outline-none focus:ring-2 ${itemError?.price
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                          }`}
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Tax Rate (%)
                      </label>
                      <select
                        {...register(`items.${index}.taxRate` as const, { valueAsNumber: true })}
                        className="block w-full px-2 py-1.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={10}>10%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>

                    <div className="col-span-12 sm:col-span-2">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Item Total
                      </label>
                      <div className="px-3 py-1.5 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-lg flex items-center h-[34px] shadow-2xs">
                        {formatCurrency(lineTotal, currentCurrency)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              icon={<Plus className="w-3.5 h-3.5 text-blue-600" />}
              className="text-blue-600 border-blue-200 hover:bg-blue-50/50"
            >
              Add Item
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-baseline gap-6 sm:gap-10">
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Subtotal:
              </span>
              <span className="text-base font-semibold text-slate-900">
                {formatCurrency(calculations.subtotal, currentCurrency)}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Tax:
              </span>
              <span className="text-base font-semibold text-slate-900">
                {formatCurrency(calculations.totalTax, currentCurrency)}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Grand Total:
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                {formatCurrency(calculations.grandTotal, currentCurrency)}
              </span>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 font-semibold text-sm shadow-sm"
            >
              Create Invoice
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

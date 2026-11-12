import { z } from 'zod';

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Item name / description is required'),
  description: z.string().trim().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  taxRate: z.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100%'),
});

export const invoiceSchema = z
  .object({
    customerId: z.string().min(1, 'Please select a customer'),
    invoiceDate: z.string().min(1, 'Invoice date is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    items: z.array(invoiceItemSchema).min(1, 'At least one invoice item is required'),
    notes: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.invoiceDate && data.dueDate) {
        return new Date(data.dueDate) >= new Date(data.invoiceDate);
      }
      return true;
    },
    {
      message: 'Due date cannot be earlier than the invoice date',
      path: ['dueDate'],
    }
  );

export type InvoiceSchemaType = z.infer<typeof invoiceSchema>;

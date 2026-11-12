import { z } from 'zod';
import { customerRepository } from '../repositories/CustomerRepository';

// Regex for international phone numbers
const phoneRegex = /^(\+?\d{1,4}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}$/;

/**
 * Address Schema
 */
export const addressSchema = z.object({
  street: z.string().trim().min(3, 'Street address must be at least 3 characters'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State or province is required'),
  postalCode: z.string().trim().min(3, 'Postal code must be at least 3 characters'),
  country: z.string().trim().min(2, 'Country is required'),
});

const optionalAddressSchema = z.object({
  street: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

/**
 * Step 1: Personal Information Schema
 * Implements:
 * 1. Base field validation
 * 2. Cross-field validation: "if email exists, phone is optional" (if email is empty, phone is required)
 */
export const step1PersonalSchema = z
  .object({
    name: z.string().trim().min(2, 'Customer / contact name must be at least 2 characters'),
    company: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .refine((val) => val === '' || z.string().email().safeParse(val).success, {
        message: 'Please provide a valid email address',
      }),
    phone: z
      .string()
      .trim()
      .refine((val) => val === '' || phoneRegex.test(val), {
        message: 'Please enter a valid phone number format (e.g. +1 555-123-4567)',
      }),
  })
  // Cross-field validation: At least one contact method (email or phone) is required
  .refine(
    (data) => {
      const hasEmail = Boolean(data.email && data.email.trim().length > 0);
      const hasPhone = Boolean(data.phone && data.phone.trim().length > 0);
      return hasEmail || hasPhone;
    },
    {
      message: 'At least one contact method (email or phone) is required',
      path: ['email'],
    }
  );

/**
 * Step 2: Address Information Schema
 * Implements:
 * 1. Billing address validation
 * 2. Conditional validation: If shippingSameAsBilling is false, shippingAddress fields are strictly required
 */
export const step2AddressSchema = z
  .object({
    billingAddress: addressSchema,
    shippingSameAsBilling: z.boolean(),
    shippingAddress: optionalAddressSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.shippingSameAsBilling) {
      const s = data.shippingAddress;
      if (!s.street || s.street.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Shipping street address is required (min 3 chars)',
          path: ['shippingAddress', 'street'],
        });
      }
      if (!s.city || s.city.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Shipping city is required',
          path: ['shippingAddress', 'city'],
        });
      }
      if (!s.state || s.state.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Shipping state is required',
          path: ['shippingAddress', 'state'],
        });
      }
      if (!s.postalCode || s.postalCode.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Shipping postal code is required',
          path: ['shippingAddress', 'postalCode'],
        });
      }
      if (!s.country || s.country.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Shipping country is required',
          path: ['shippingAddress', 'country'],
        });
      }
    }
  });

/**
 * Step 3: Account & Terms Schema
 */
export const step3AccountSchema = z.object({
  paymentTerms: z.enum(['due_on_receipt', 'net_15', 'net_30', 'net_60']).default('net_30'),
  currency: z.string().min(1, 'Please select a currency').default('INR'),
  notes: z.string().trim().optional(),
});

/**
 * Async validation helper:
 * Checks if the email is already in IndexedDB via customerRepository
 */
export async function validateEmailUniqueness(email: string, excludeId?: string): Promise<string | null> {
  if (!email || email.trim() === '') return null;
  const exists = await customerRepository.emailExists(email, excludeId);
  if (exists) {
    return `This email is already in use`;
  }
  return null;
}

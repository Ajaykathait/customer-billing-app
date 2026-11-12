export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type PaymentTerms = 'due_on_receipt' | 'net_15' | 'net_30' | 'net_60';

export interface Customer {
  id: string;
  // Step 1: Personal Information
  name: string;
  email: string;
  phone: string;
  company?: string;

  // Step 2: Address Information
  billingAddress: Address;
  shippingSameAsBilling: boolean;
  shippingAddress: Address;

  // Step 3: Account & Terms
  paymentTerms: PaymentTerms;
  currency: string;
  notes?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  // Step 1
  name: string;
  email: string;
  phone: string;
  company?: string;

  // Step 2
  billingAddress: Address;
  shippingSameAsBilling: boolean;
  shippingAddress: Address;

  // Step 3
  paymentTerms: PaymentTerms;
  currency: string;
  notes?: string;
}

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { CustomerFormData } from '../../types/customer';
import {
  step1PersonalSchema,
  step2AddressSchema,
  step3AccountSchema,
  validateEmailUniqueness,
} from '../../schemas/customerSchema';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StepIndicator } from './StepIndicator';
import { Step1PersonalInfo } from './Step1PersonalInfo';
import { Step2AddressInfo } from './Step2AddressInfo';
import { Step3AccountReview } from './Step3AccountReview';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => Promise<unknown>;
}

const defaultValues: CustomerFormData = {
  name: '',
  company: '',
  email: '',
  phone: '',
  billingAddress: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  },
  shippingSameAsBilling: true,
  shippingAddress: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  },
  paymentTerms: 'net_30',
  currency: 'INR',
  notes: '',
};

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState<boolean>(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [asyncEmailError, setAsyncEmailError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<CustomerFormData>({
    defaultValues,
    mode: 'onTouched',
  });

  const { setError, clearErrors, getValues, reset } = form;

  const steps = [
    { title: 'Personal Info', subtitle: 'Name, email & phone' },
    { title: 'Addresses', subtitle: 'Billing & shipping' },
    { title: 'Billing Terms', subtitle: 'Payment terms & review' },
  ];

  const handleClose = () => {
    reset(defaultValues);
    setCurrentStep(1);
    setAsyncEmailError(null);
    setEmailAvailable(null);
    setGlobalError(null);
    onClose();
  };

  // Check email uniqueness
  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    if (!email || email.trim() === '') {
      setAsyncEmailError(null);
      setEmailAvailable(null);
      return true;
    }
    try {
      setIsCheckingEmail(true);
      const errorMsg = await validateEmailUniqueness(email);
      if (errorMsg) {
        setAsyncEmailError(errorMsg);
        setEmailAvailable(false);
        setError('email', { type: 'manual', message: errorMsg });
        return false;
      } else {
        setAsyncEmailError(null);
        setEmailAvailable(true);
        clearErrors('email');
        return true;
      }
    } catch {
      return true;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Validate Step 1
  const validateStep1 = async (): Promise<boolean> => {
    const values = getValues();
    const result = step1PersonalSchema.safeParse({
      name: values.name,
      company: values.company,
      email: values.email,
      phone: values.phone,
    });

    if (!result.success) {
      // Map Zod errors to react-hook-form
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CustomerFormData;
        if (field) {
          setError(field, { type: 'manual', message: issue.message });
        }
      });
      return false;
    }

    // Run async validation for email in IndexedDB
    if (values.email && values.email.trim().length > 0) {
      const isUnique = await checkEmailAvailability(values.email);
      if (!isUnique) return false;
    }

    return true;
  };

  // Validate Step 2
  const validateStep2 = async (): Promise<boolean> => {
    const values = getValues();
    const result = step2AddressSchema.safeParse({
      billingAddress: values.billingAddress,
      shippingSameAsBilling: values.shippingSameAsBilling,
      shippingAddress: values.shippingAddress,
    });

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.') as `billingAddress.${keyof CustomerFormData['billingAddress']}` | `shippingAddress.${keyof CustomerFormData['shippingAddress']}`;
        setError(path as unknown as keyof CustomerFormData, {
          type: 'manual',
          message: issue.message,
        });
      });
      return false;
    }

    return true;
  };

  // Validate Step 3
  const validateStep3 = async (): Promise<boolean> => {
    const values = getValues();
    const result = step3AccountSchema.safeParse({
      paymentTerms: values.paymentTerms,
      currency: values.currency,
      notes: values.notes,
    });

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CustomerFormData;
        if (field) {
          setError(field, { type: 'manual', message: issue.message });
        }
      });
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    setGlobalError(null);
    if (currentStep === 1) {
      const isValid = await validateStep1();
      if (isValid) setCurrentStep(2);
    } else if (currentStep === 2) {
      const isValid = await validateStep2();
      if (isValid) setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setGlobalError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = async () => {
    setGlobalError(null);
    const isStep3Valid = await validateStep3();
    if (!isStep3Valid) return;

    try {
      setIsSubmitting(true);
      const values = getValues();
      await onSubmit(values);
      handleClose();
    } catch (err: unknown) {
      console.error('Customer submission error:', err);
      setGlobalError(err instanceof Error ? err.message : 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Customer"
      maxWidth="2xl"
    >
      <div>
        <StepIndicator
          currentStep={currentStep}
          steps={steps}
        />

        {globalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{globalError}</span>
          </div>
        )}

        {/* Step Forms */}
        <div className="min-h-[300px]">
          {currentStep === 1 && (
            <Step1PersonalInfo
              form={form}
              isCheckingEmail={isCheckingEmail}
              emailAvailable={emailAvailable}
              asyncEmailError={asyncEmailError}
              onEmailBlur={checkEmailAvailability}
            />
          )}

          {currentStep === 2 && (
            <Step2AddressInfo form={form} />
          )}

          {currentStep === 3 && (
            <Step3AccountReview form={form} />
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                icon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              Cancel
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleNext}
                isLoading={isCheckingEmail}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleFinalSubmit}
                isLoading={isSubmitting}
                icon={<Check className="w-3.5 h-3.5" />}
              >
                Create Customer
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

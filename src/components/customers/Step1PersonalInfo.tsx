import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CustomerFormData } from '../../types/customer';
import { Input } from '../ui/Input';
import { Building2, User, Loader2, CheckCircle2 } from 'lucide-react';

interface Step1Props {
  form: UseFormReturn<CustomerFormData>;
  isCheckingEmail: boolean;
  emailAvailable: boolean | null;
  asyncEmailError: string | null;
  onEmailBlur: (email: string) => void;
}

export const Step1PersonalInfo: React.FC<Step1Props> = ({
  form,
  isCheckingEmail,
  emailAvailable,
  asyncEmailError,
  onEmailBlur,
}) => {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const emailValue = watch('email');
  const phoneValue = watch('phone');

  const hasEmail = Boolean(emailValue && emailValue.trim().length > 0);
  const hasPhone = Boolean(phoneValue && phoneValue.trim().length > 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <Input
            label="Full Name / Primary Contact"
            placeholder="e.g. Alex Morgan"
            required
            {...register('name')}
            error={errors.name?.message}
            prefixText={<User className="w-4 h-4 text-slate-400" /> as unknown as string}
          />
        </div>

        {/* Company Name */}
        <div className="sm:col-span-2">
          <Input
            label="Company Name"
            placeholder="e.g. TechCorp Solutions (optional)"
            {...register('company')}
            error={errors.company?.message}
            prefixText={<Building2 className="w-4 h-4 text-slate-400" /> as unknown as string}
          />
        </div>

        {/* Email Address */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Email Address {!hasPhone && <span className="text-red-500">*</span>}
            </label>
            {isCheckingEmail && (
              <span className="flex items-center gap-1 text-[11px] text-blue-600">
                <Loader2 className="w-3 h-3 animate-spin" /> Checking...
              </span>
            )}
            {!isCheckingEmail && emailAvailable === true && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Available
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="email"
              placeholder="e.g. alex@example.com"
              {...register('email', {
                onBlur: (e) => onEmailBlur(e.target.value),
              })}
              className={`block w-full px-3.5 py-2 text-sm text-slate-900 bg-white border rounded-lg transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.email || asyncEmailError
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
          </div>
          {(errors.email?.message || asyncEmailError) && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.email?.message || asyncEmailError}
            </p>
          )}
          {!errors.email && !asyncEmailError && (
            <p className="mt-1 text-[11px] text-slate-500">
              {hasPhone ? 'Optional (phone provided)' : 'Required if no phone provided'}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Phone Number {!hasEmail && <span className="text-red-500">*</span>}
            </label>
            <span className="text-[11px] text-slate-400">
              {hasEmail ? 'Optional' : 'Required'}
            </span>
          </div>
          <Input
            placeholder="e.g. +1 555-234-5678"
            {...register('phone')}
            error={errors.phone?.message}
            helperText={
              hasEmail
                ? 'Optional (email provided)'
                : 'Required if no email provided'
            }
          />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CustomerFormData } from '../../types/customer';
import { Input } from '../ui/Input';
import { MapPin, Truck } from 'lucide-react';

interface Step2Props {
  form: UseFormReturn<CustomerFormData>;
}

export const Step2AddressInfo: React.FC<Step2Props> = ({ form }) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const sameAsBilling = watch('shippingSameAsBilling');
  const billingStreet = watch('billingAddress.street');
  const billingCity = watch('billingAddress.city');
  const billingState = watch('billingAddress.state');
  const billingPostalCode = watch('billingAddress.postalCode');
  const billingCountry = watch('billingAddress.country');

  // When toggle is checked, optionally keep shippingAddress in sync
  const handleToggleSameAsBilling = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setValue('shippingSameAsBilling', checked);
    if (checked) {
      setValue('shippingAddress.street', billingStreet);
      setValue('shippingAddress.city', billingCity);
      setValue('shippingAddress.state', billingState);
      setValue('shippingAddress.postalCode', billingPostalCode);
      setValue('shippingAddress.country', billingCountry);
    }
  };

  return (
    <div className="space-y-6">
      {/* Billing Address Section */}
      <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold text-sm">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Billing Address</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <Input
              label="Street Address"
              placeholder="e.g. 120 Cypress Creek Lane"
              required
              {...register('billingAddress.street')}
              error={errors.billingAddress?.street?.message}
            />
          </div>

          <div>
            <Input
              label="City"
              placeholder="e.g. Cypress Creek"
              required
              {...register('billingAddress.city')}
              error={errors.billingAddress?.city?.message}
            />
          </div>

          <div>
            <Input
              label="State / Province"
              placeholder="e.g. Oregon"
              required
              {...register('billingAddress.state')}
              error={errors.billingAddress?.state?.message}
            />
          </div>

          <div>
            <Input
              label="Postal / ZIP Code"
              placeholder="e.g. 97401"
              required
              {...register('billingAddress.postalCode')}
              error={errors.billingAddress?.postalCode?.message}
            />
          </div>

          <div>
            <Input
              label="Country"
              placeholder="e.g. United States"
              required
              {...register('billingAddress.country')}
              error={errors.billingAddress?.country?.message}
            />
          </div>
        </div>
      </div>

      {/* Toggle to Copy Billing to Shipping */}
      <div className="flex items-center justify-between p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <Truck className="w-4 h-4 text-blue-600" />
          <div>
            <div className="text-xs font-semibold text-slate-800">
              Shipping Address
            </div>
            <div className="text-[11px] text-slate-500">
              Toggle to copy billing address to shipping automatically
            </div>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={sameAsBilling}
            onChange={handleToggleSameAsBilling}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-2.5 text-xs font-medium text-slate-700">
            {sameAsBilling ? 'Same as billing' : 'Different address'}
          </span>
        </label>
      </div>

      {/* Shipping Address Section (Conditional on Toggle) */}
      {!sameAsBilling && (
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-slate-800 text-sm">
              Shipping Address Details
            </span>
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
              Required when unchecked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <Input
                label="Shipping Street Address"
                placeholder="e.g. 900 Boulder Ridge"
                required
                {...register('shippingAddress.street')}
                error={errors.shippingAddress?.street?.message}
              />
            </div>

            <div>
              <Input
                label="Shipping City"
                placeholder="e.g. Flagstaff"
                required
                {...register('shippingAddress.city')}
                error={errors.shippingAddress?.city?.message}
              />
            </div>

            <div>
              <Input
                label="Shipping State / Province"
                placeholder="e.g. Arizona"
                required
                {...register('shippingAddress.state')}
                error={errors.shippingAddress?.state?.message}
              />
            </div>

            <div>
              <Input
                label="Shipping Postal / ZIP Code"
                placeholder="e.g. 86001"
                required
                {...register('shippingAddress.postalCode')}
                error={errors.shippingAddress?.postalCode?.message}
              />
            </div>

            <div>
              <Input
                label="Shipping Country"
                placeholder="e.g. United States"
                required
                {...register('shippingAddress.country')}
                error={errors.shippingAddress?.country?.message}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: { title: string; subtitle: string }[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  steps,
}) => {
  return (
    <div className="w-full pb-6 mb-6 border-b border-slate-100">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <React.Fragment key={step.title}>
              {/* Step Circle & Text */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                <div className="hidden sm:block text-left">
                  <div
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-blue-700' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-[11px] text-slate-400">{step.subtitle}</div>
                </div>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 mx-3 h-0.5 rounded transition-all ${
                    index + 1 < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

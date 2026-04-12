'use client';

import { Check } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
}

const steps = [
  { label: 'Upload Resume', sub: 'PDF extraction' },
  { label: 'Verify Identity', sub: 'Webcam check' },
  { label: 'Record Answer', sub: 'Voice verification' },
];

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => {
        const num = i + 1;
        const isDone = currentStep > num;
        const isActive = currentStep === num;

        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-mono font-bold border-2 transition-all duration-500 ${
                  isDone
                    ? 'bg-nt-cyan border-nt-cyan text-nt-bg'
                    : isActive
                      ? 'bg-nt-bg border-nt-cyan text-nt-cyan shadow-glow-cyan'
                      : 'bg-nt-bg-2 border-gray-700 text-gray-600'
                }`}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> : num}
                {isActive && (
                  <span className="absolute inset-0 rounded-full border-2 border-nt-cyan animate-ping opacity-40" />
                )}
              </div>
              <div className="text-center">
                <p
                  className={`text-xs font-medium ${isActive ? 'text-white' : isDone ? 'text-nt-cyan' : 'text-gray-600'}`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-gray-600 font-mono">
                  {step.sub}
                </p>
              </div>
            </div>

            {i < steps.length - 1 && (
              <div className="relative w-20 h-px mx-3 mb-7">
                <div className="absolute inset-0 bg-gray-800" />
                <div
                  className="absolute inset-0 bg-nt-cyan transition-all duration-700 ease-out"
                  style={{ width: isDone ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

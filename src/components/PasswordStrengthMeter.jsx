import React from 'react';
import { Check, X } from 'lucide-react';

export function checkPasswordRequirements(password = '') {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  let score = 0;
  if (minLength) score++;
  if (hasUpper) score++;
  if (hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  let label = 'Weak';
  let color = 'bg-red-500';
  let textColor = 'text-red-400';
  let percentage = (score / 5) * 100;

  if (score >= 4) {
    label = 'Strong';
    color = 'bg-emerald-500';
    textColor = 'text-emerald-400';
  } else if (score >= 2) {
    label = 'Medium';
    color = 'bg-yellow-500';
    textColor = 'text-yellow-400';
  }

  return {
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    score,
    label,
    color,
    textColor,
    percentage,
    isValid: minLength && hasUpper && hasLower && hasNumber
  };
}

export const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null;

  const reqs = checkPasswordRequirements(password);

  return (
    <div className="mt-2 space-y-2 text-xs">
      {/* Strength Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${reqs.color}`} 
            style={{ width: `${reqs.percentage}%` }}
          />
        </div>
        <span className={`font-semibold ${reqs.textColor}`}>{reqs.label}</span>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400 pt-1">
        <div className="flex items-center gap-1.5">
          {reqs.minLength ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
          <span className={reqs.minLength ? 'text-slate-200' : ''}>Min 8 characters</span>
        </div>
        <div className="flex items-center gap-1.5">
          {reqs.hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
          <span className={reqs.hasUpper ? 'text-slate-200' : ''}>1 Uppercase letter</span>
        </div>
        <div className="flex items-center gap-1.5">
          {reqs.hasLower ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
          <span className={reqs.hasLower ? 'text-slate-200' : ''}>1 Lowercase letter</span>
        </div>
        <div className="flex items-center gap-1.5">
          {reqs.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
          <span className={reqs.hasNumber ? 'text-slate-200' : ''}>1 Number</span>
        </div>
      </div>
    </div>
  );
};

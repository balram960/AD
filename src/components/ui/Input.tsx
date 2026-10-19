import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-stone-700">{label}</label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2.5 rounded-lg border text-stone-800 text-sm
            placeholder:text-stone-400 bg-white
            focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent
            disabled:bg-stone-50 disabled:text-stone-500
            ${error ? 'border-red-400' : 'border-stone-200'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

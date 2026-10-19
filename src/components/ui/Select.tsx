import { type SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-stone-700">{label}</label>}
        <select
          ref={ref}
          className={`
            w-full px-3 py-2.5 rounded-lg border text-stone-800 text-sm bg-white
            focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent
            disabled:bg-stone-50
            ${error ? 'border-red-400' : 'border-stone-200'}
            ${className}
          `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

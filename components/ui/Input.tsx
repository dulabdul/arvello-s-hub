import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`h-10 px-3.5 rounded-lg border text-sm text-brand-text bg-brand-surface placeholder:text-brand-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary disabled:opacity-50 disabled:bg-brand-bg [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:invert ${
            error
              ? "border-brand-danger focus-visible:border-brand-danger focus-visible:ring-brand-danger/20"
              : "border-brand-border"
          } ${className}`}
          {...props}
        />
        {hint && !error && <p className="text-xs text-brand-muted">{hint}</p>}
        {error && <p className="text-xs text-brand-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`h-10 px-3 rounded-lg border text-sm text-brand-text bg-brand-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary ${
            error
              ? "border-brand-danger focus-visible:border-brand-danger focus-visible:ring-brand-danger/20"
              : "border-brand-border"
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-brand-danger">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

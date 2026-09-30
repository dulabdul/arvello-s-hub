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
          className={`h-11 px-3.5 rounded-lg border text-base sm:text-sm text-brand-text bg-brand-surface placeholder:text-brand-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary disabled:opacity-50 disabled:bg-brand-bg [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:invert ${
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
          className={`h-11 px-3 rounded-lg border text-base sm:text-sm text-brand-text bg-brand-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary ${
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

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  label?: string;
  error?: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, error, hint, value, onChange, className = "", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>(
      value ? value.toLocaleString("id-ID") : ""
    );

    React.useEffect(() => {
      if (value !== undefined) {
        // Only update if value from prop is out of sync with displayValue
        // so we don't break the user's typing (e.g. deleting last zero)
        const parsedDisplay = parseInt(displayValue.replace(/\./g, ""), 10);
        if (parsedDisplay !== value && !(value === 0 && displayValue === "")) {
          setDisplayValue(value === 0 ? "" : value.toLocaleString("id-ID"));
        }
      }
    }, [value, displayValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      if (!/^[0-9.]*$/.test(rawValue)) return;

      const numericString = rawValue.replace(/\./g, "");
      const numValue = numericString === "" ? 0 : parseInt(numericString, 10);
      
      if (!isNaN(numValue)) {
        const formatted = numericString === "" ? "" : numValue.toLocaleString("id-ID");
        setDisplayValue(formatted);
        onChange(numValue);
      }
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-brand-muted">Rp</span>
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            className={`w-full h-11 pl-9 pr-3.5 rounded-lg border text-base sm:text-sm text-brand-text bg-brand-surface placeholder:text-brand-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary disabled:opacity-50 disabled:bg-brand-bg ${
              error
                ? "border-brand-danger focus-visible:border-brand-danger focus-visible:ring-brand-danger/20"
                : "border-brand-border"
            } ${className}`}
            {...props}
          />
        </div>
        {hint && !error && <p className="text-xs text-brand-muted">{hint}</p>}
        {error && <p className="text-xs text-brand-danger">{error}</p>}
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 gap-1.5 h-8",
    md: "text-sm px-4 py-2 gap-2 h-10",
    lg: "text-base px-5 py-2.5 gap-2.5 h-12",
  };

  const variants = {
    primary:
      "bg-brand-primary text-white hover:bg-brand-primary-dark active:bg-brand-primary-dark focus-visible:ring-brand-primary shadow-sm",
    secondary:
      "bg-brand-bg text-brand-text hover:bg-brand-surface border border-brand-border focus-visible:ring-brand-border",
    outline:
      "border border-brand-border text-brand-text hover:bg-brand-bg focus-visible:ring-brand-primary",
    danger:
      "bg-brand-danger text-white hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-brand-danger shadow-sm",
    ghost:
      "text-brand-muted hover:bg-brand-bg hover:text-brand-text focus-visible:ring-brand-border",
  };

  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

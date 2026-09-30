import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "", onClick, ...props }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-brand-surface border border-brand-border rounded-xl p-5 shadow-xs transition-all ${
        onClick ? "cursor-pointer hover:border-brand-primary/50 hover:shadow-sm" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-brand-text">{title}</h3>
        {subtitle && <p className="text-xs text-brand-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

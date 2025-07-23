'use client';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-b-2'
  };

  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} border-emerald-500 ${className}`}
      role="status"
      aria-label="loading"
    ></div>
  );
}
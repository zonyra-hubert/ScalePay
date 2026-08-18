import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 24 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ScalePay Logo"
    >
      {/* Crisp geometric fintech logo mark */}
      <rect width="32" height="32" rx="7" className="fill-foreground" />
      <path
        d="M8 21.5L14 14.5L19 19.5L24 10.5"
        stroke="var(--background)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="10.5" r="1.5" fill="var(--background)" />
    </svg>
  );
}

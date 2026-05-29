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
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" rx="28" fill="#5865F2" />
      <circle cx="42" cy="58" r="16" stroke="white" strokeWidth="5" fill="none" />
      <path
        d="M39.5 54.5 L42 52 V64"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="58" cy="42" r="16" stroke="white" strokeWidth="5" fill="#5865F2" />
      <path
        d="M55.5 38.5 L58 36 V48"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

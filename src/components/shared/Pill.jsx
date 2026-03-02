import React from 'react';

const sizeClasses = {
  sm: 'pill',
  lg: 'pill pill-lg',
  xl: 'pill pill-xl',
};

export default function Pill({ variant = 'navy', size = 'sm', children }) {
  const sizeClass = sizeClasses[size] || 'pill';
  return <span className={`${sizeClass} pill-${variant}`}>{children}</span>;
}

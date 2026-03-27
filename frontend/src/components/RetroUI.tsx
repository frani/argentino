import React from 'react';
import type { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WindowProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export const Window = ({ children, className, title }: WindowProps) => (
  <div className={cn("window flex flex-col h-full", className)}>
    {title && (
      <div className="title-bar shrink-0">
        <span>{title}</span>
        <div className="flex gap-1">
          <button className="bg-retro-bg text-black border border-black px-1 text-xs shadow-button">_</button>
          <button className="bg-retro-bg text-black border border-black px-1 text-xs shadow-button">×</button>
        </div>
      </div>
    )}
    <div className="window-content flex-1">
      {children}
    </div>
  </div>
);

interface RetroButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const RetroButton = ({ children, onClick, className, disabled }: RetroButtonProps) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={cn("retro-button disabled:opacity-50 font-bold", className)}
  >
    {children}
  </button>
);

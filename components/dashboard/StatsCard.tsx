'use client';

import { Activity } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  progress?: number;
  progressText?: string;
  backgroundColor?: string;
  onClick?: () => void;
  className?: string;
  valueClassName?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  progress,
  progressText,
  backgroundColor = 'white',
  onClick,
  className = '',
  valueClassName = 'text-5xl brutal-heading'
}: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      className={`brutal-card p-4 xs:p-6 flex flex-col justify-between ${onClick ? 'cursor-pointer hover:translate-x-1 hover:-translate-y-1 transition-transform group relative overflow-hidden' : ''} ${className}`}
      style={{ backgroundColor: backgroundColor.startsWith('var') ? backgroundColor : undefined }}
    >
      <div className="flex justify-between items-start">
        <span className="font-mono text-[10px] sm:text-xs uppercase font-bold text-gray-700 tracking-tighter">{title}</span>
        {icon && <div className="opacity-50 group-hover:scale-125 transition-transform">{icon}</div>}
      </div>
      <div className="mt-8 flex items-baseline gap-2">
        <span className={valueClassName}>{value}</span>
        {subtitle && <span className="font-mono text-lg font-black opacity-70 uppercase">{subtitle}</span>}
      </div>
      {(progress !== undefined || progressText) && (
        <div className="mt-6 flex items-center gap-4">
          {progress !== undefined && (
            <div className={`flex-1 h-6 ${backgroundColor === 'white' ? 'bg-gray-100' : 'bg-white'} border-[3px] border-black rounded-full flex overflow-hidden shadow-brutal-sm`}>
              <div className={`h-full ${backgroundColor === 'white' ? 'bg-[var(--color-neon-fuchsia)]' : 'bg-black'} rounded-full`} style={{ width: `${progress}%` }}></div>
            </div>
          )}
          {progressText && <span className="font-mono text-[10px] font-black uppercase tracking-widest">{progressText}</span>}
        </div>
      )}
      {onClick && <div className="mt-2 text-right opacity-50 font-mono text-[9px] font-bold uppercase text-black">Ver detalles →</div>}
    </div>
  );
}

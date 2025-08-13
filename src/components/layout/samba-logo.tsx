import React from 'react'
import { cn } from '@/lib/utils'

export interface SambaLogoProps {
  className?: string;
  variant?: 'default' | 'simple';
}

export const SambaLogo: React.FC<SambaLogoProps> = ({
  className,
  variant = 'default'
}) => {
  if (variant === 'simple') {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white font-bold text-lg',
        className
      )}>
        S
      </div>
    )
  }

  return (
    <svg
      className={cn('text-red-600', className)}
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Samba-inspired logo design */}
      <defs>
        <linearGradient id="sambaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>

      {/* Main circle */}
      <circle cx="50" cy="50" r="45" fill="url(#sambaGradient)" />

      {/* Inner design representing network/sharing */}
      <g fill="white">
        {/* Central node */}
        <circle cx="50" cy="50" r="8" />

        {/* Connected nodes */}
        <circle cx="25" cy="25" r="5" />
        <circle cx="75" cy="25" r="5" />
        <circle cx="25" cy="75" r="5" />
        <circle cx="75" cy="75" r="5" />

        {/* Connection lines */}
        <line x1="50" y1="50" x2="25" y2="25" stroke="white" strokeWidth="2" />
        <line x1="50" y1="50" x2="75" y2="25" stroke="white" strokeWidth="2" />
        <line x1="50" y1="50" x2="25" y2="75" stroke="white" strokeWidth="2" />
        <line x1="50" y1="50" x2="75" y2="75" stroke="white" strokeWidth="2" />

        {/* Additional nodes */}
        <circle cx="50" cy="20" r="3" />
        <circle cx="80" cy="50" r="3" />
        <circle cx="50" cy="80" r="3" />
        <circle cx="20" cy="50" r="3" />

        {/* Additional connections */}
        <line x1="50" y1="42" x2="50" y2="20" stroke="white" strokeWidth="1.5" />
        <line x1="58" y1="50" x2="80" y2="50" stroke="white" strokeWidth="1.5" />
        <line x1="50" y1="58" x2="50" y2="80" stroke="white" strokeWidth="1.5" />
        <line x1="42" y1="50" x2="20" y2="50" stroke="white" strokeWidth="1.5" />
      </g>
    </svg>
  )
}

export default SambaLogo

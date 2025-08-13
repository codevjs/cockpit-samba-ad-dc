import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  variant?: 'default' | 'overlay';
}

const sizeConfig = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
  variant = 'default'
}) => {
  const spinnerContent = (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin', sizeConfig[size])} />
      {text && (
        <span className="ml-2 text-sm text-muted-foreground">
          {text}
        </span>
      )}
    </div>
  )

  if (variant === 'overlay') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinnerContent}
      </div>
    )
  }

  return spinnerContent
}

// Full page loading component
export interface PageLoadingProps {
  text?: string;
  description?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  text = 'Loading...',
  description
}) => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <LoadingSpinner size="lg" />
      <div className="text-center">
        <p className="text-lg font-medium">{text}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}

// Loading state for tables/lists
export const LoadingTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 3
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 bg-muted rounded animate-pulse"
              style={{ width: `${Math.random() * 40 + 60}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Loading state for cards
export const LoadingCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('p-6 border rounded-lg space-y-4', className)}>
      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded animate-pulse" />
        <div className="h-3 bg-muted rounded animate-pulse w-5/6" />
      </div>
    </div>
  )
}

// Inline loading for buttons
export const ButtonSpinner: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Loader2 className={cn('h-4 w-4 animate-spin', className)} />
  )
}

export default LoadingSpinner

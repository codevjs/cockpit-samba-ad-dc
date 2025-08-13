import React from 'react'
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

// Loading Component
interface LoadingProps {
  loading: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  loading,
  size = 'md',
  text = 'Loading...',
  className
}) => {
  if (!loading) return null

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

// Error Alert Component
interface RenderErrorProps {
  error: string;
  hideAlert: () => void;
  alertVisible: boolean;
  title?: string;
  className?: string;
}

export const RenderError: React.FC<RenderErrorProps> = ({
  error,
  hideAlert,
  alertVisible,
  title = 'Error',
  className
}) => {
  if (!alertVisible || !error) return null

  return (
    <Alert variant="destructive" className={cn('relative', className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0"
        onClick={hideAlert}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  )
}

// Success Alert Component
interface SuccessProps {
  message: string;
  hideAlert: () => void;
  alertVisible: boolean;
  title?: string;
  className?: string;
}

export const Success: React.FC<SuccessProps> = ({
  message,
  hideAlert,
  alertVisible,
  title = 'Success',
  className
}) => {
  if (!alertVisible || !message) return null

  return (
    <Alert className={cn('relative border-green-200 bg-green-50 text-green-800', className)}>
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0 text-green-600 hover:text-green-800"
        onClick={hideAlert}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  )
}

// Back Button Component
interface BackButtonProps {
  onClick?: () => void;
  text?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  text = 'Back',
  className
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Default behavior: go back in history
      window.history.back()
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={cn('gap-2', className)}
    >
      <ArrowLeft className="h-4 w-4" />
      {text}
    </Button>
  )
}

// Error Toast Component (for temporary notifications)
interface ErrorToastProps {
  errorMessage: string;
  closeModal: () => void;
  className?: string;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  errorMessage,
  closeModal,
  className
}) => {
  React.useEffect(() => {
    if (errorMessage) {
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(closeModal, 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage, closeModal])

  if (!errorMessage) return null

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-full',
      className
    )}>
      <Alert variant="destructive" className="shadow-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0"
          onClick={closeModal}
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  )
}

// Success Toast Component
interface SuccessToastProps {
  successMessage: string;
  closeModal: () => void;
  className?: string;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
  successMessage,
  closeModal,
  className
}) => {
  React.useEffect(() => {
    if (successMessage) {
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(closeModal, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, closeModal])

  if (!successMessage) return null

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-full',
      className
    )}>
      <Alert className="shadow-lg border-green-200 bg-green-50 text-green-800">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>{successMessage}</AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 text-green-600 hover:text-green-800"
          onClick={closeModal}
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  )
}

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { 
  AlertCircle, 
  X, 
  RefreshCw, 
  Info, 
  AlertTriangle,
  XCircle
} from 'lucide-react';

// Custom error classes
export class APIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export interface ErrorAlertProps {
  error: Error | APIError | ValidationError | NetworkError | string | null;
  title?: string;
  variant?: 'default' | 'destructive' | 'warning';
  onDismiss?: () => void;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  showIcon?: boolean;
  collapsible?: boolean;
  children?: React.ReactNode;
}

const getErrorIcon = (error: Error | string | null, variant: string) => {
  if (typeof error === 'string') {
    return variant === 'warning' ? AlertTriangle : AlertCircle;
  }

  if (error instanceof ValidationError) {
    return Info;
  }
  
  if (error instanceof NetworkError) {
    return RefreshCw;
  }
  
  if (error instanceof APIError) {
    return XCircle;
  }

  return variant === 'warning' ? AlertTriangle : AlertCircle;
};

const getErrorDetails = (error: Error | string | null) => {
  if (typeof error === 'string') {
    return { message: error, code: undefined, details: undefined };
  }

  if (!error) {
    return { message: '', code: undefined, details: undefined };
  }

  if (error instanceof APIError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof ValidationError) {
    return {
      message: error.message,
      field: error.field,
      value: error.value,
    };
  }

  return {
    message: error.message,
    name: error.name,
  };
};

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  title,
  variant = 'destructive',
  onDismiss,
  onRetry,
  retryLabel = 'Retry',
  className,
  showIcon = true,
  collapsible = false,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  if (!error) return null;

  const errorDetails = getErrorDetails(error);
  const IconComponent = getErrorIcon(error, variant);
  const defaultTitle = title || (
    error instanceof ValidationError ? 'Validation Error' :
    error instanceof NetworkError ? 'Connection Error' :
    error instanceof APIError ? 'Server Error' :
    'Error'
  );

  return (
    <Alert variant={variant} className={cn('relative', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2 flex-1 min-w-0">
          {showIcon && <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <AlertTitle className="text-sm font-medium">
                {defaultTitle}
              </AlertTitle>
              {collapsible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="h-6 w-6 p-0 ml-2"
                >
                  <X className={cn(
                    'h-3 w-3 transition-transform',
                    isCollapsed ? 'rotate-45' : ''
                  )} />
                </Button>
              )}
            </div>
            
            {!isCollapsed && (
              <>
                <AlertDescription className="mt-1 text-sm">
                  {errorDetails.message}
                </AlertDescription>

                {/* Additional error details */}
                {(errorDetails.code || errorDetails.statusCode || errorDetails.field) && (
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    {errorDetails.code && (
                      <div>Error Code: {errorDetails.code}</div>
                    )}
                    {errorDetails.statusCode && (
                      <div>Status: {errorDetails.statusCode}</div>
                    )}
                    {errorDetails.field && (
                      <div>Field: {errorDetails.field}</div>
                    )}
                  </div>
                )}

                {/* Custom children content */}
                {children && (
                  <div className="mt-2">
                    {children}
                  </div>
                )}

                {/* Action buttons */}
                {(onRetry || onDismiss) && (
                  <div className="flex items-center space-x-2 mt-3">
                    {onRetry && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="h-7 px-2 text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {retryLabel}
                      </Button>
                    )}
                    {onDismiss && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDismiss}
                        className="h-7 px-2 text-xs"
                      >
                        Dismiss
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Close button */}
        {onDismiss && !collapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 ml-2 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Alert>
  );
};

// Specialized error components
export interface NetworkErrorAlertProps {
  onRetry?: () => void;
  onDismiss?: () => void;
  message?: string;
}

export const NetworkErrorAlert: React.FC<NetworkErrorAlertProps> = ({
  onRetry,
  onDismiss,
  message = 'Unable to connect to the server. Please check your connection and try again.',
}) => {
  return (
    <ErrorAlert
      error={new NetworkError(message)}
      title="Connection Error"
      variant="warning"
      onRetry={onRetry}
      onDismiss={onDismiss}
      retryLabel="Retry Connection"
    />
  );
};

export interface ValidationErrorAlertProps {
  errors: ValidationError[];
  onDismiss?: () => void;
}

export const ValidationErrorAlert: React.FC<ValidationErrorAlertProps> = ({
  errors,
  onDismiss,
}) => {
  const message = errors.length === 1 
    ? errors[0].message
    : `${errors.length} validation errors occurred`;

  return (
    <ErrorAlert
      error={new ValidationError(message)}
      title="Validation Error"
      variant="warning"
      onDismiss={onDismiss}
    >
      {errors.length > 1 && (
        <ul className="mt-2 text-sm space-y-1 list-disc list-inside">
          {errors.map((error, index) => (
            <li key={index}>
              {error.field && <strong>{error.field}:</strong>} {error.message}
            </li>
          ))}
        </ul>
      )}
    </ErrorAlert>
  );
};

// Hook for managing error state
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: unknown) => {
    if (error instanceof Error) {
      setError(error);
    } else if (typeof error === 'string') {
      setError(new Error(error));
    } else {
      setError(new Error('An unexpected error occurred'));
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const retryWithClear = React.useCallback(async (retryFn: () => Promise<void>) => {
    try {
      clearError();
      await retryFn();
    } catch (err) {
      handleError(err);
    }
  }, [handleError, clearError]);

  return {
    error,
    handleError,
    clearError,
    retryWithClear,
  };
};

export default ErrorAlert;
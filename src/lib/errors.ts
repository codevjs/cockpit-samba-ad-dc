// Error Handling Utilities

export class APIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'APIError';
    
    // Maintain proper stack trace for V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      statusCode: this.statusCode,
    };
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public field?: string, public value?: unknown) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', undefined, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', undefined, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', { resource, id }, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends APIError {
  constructor(message: string, conflictingResource?: string) {
    super(message, 'CONFLICT', { conflictingResource }, 409);
    this.name = 'ConflictError';
  }
}

export class NetworkError extends APIError {
  constructor(message: string = 'Network connection failed') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends APIError {
  constructor(operation: string, timeout: number) {
    super(`Operation '${operation}' timed out after ${timeout}ms`, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

// Error Parser for Samba Tool Output
export class SambaErrorParser {
  private static readonly ERROR_PATTERNS = {
    USER_EXISTS: /user '(.+)' already exists/i,
    USER_NOT_FOUND: /user '(.+)' not found/i,
    GROUP_EXISTS: /group '(.+)' already exists/i,
    GROUP_NOT_FOUND: /group '(.+)' not found/i,
    COMPUTER_EXISTS: /computer '(.+)' already exists/i,
    COMPUTER_NOT_FOUND: /computer '(.+)' not found/i,
    INVALID_PASSWORD: /password does not meet complexity requirements/i,
    ACCESS_DENIED: /access denied|insufficient privileges/i,
    DOMAIN_CONTROLLER_UNREACHABLE: /failed to connect|connection refused/i,
    INVALID_CREDENTIALS: /invalid credentials|authentication failed/i,
    SYNTAX_ERROR: /invalid syntax|malformed/i,
  };

  static parseError(output: string, operation?: string): APIError {
    const errorText = output.toLowerCase();
    
    // Check for specific error patterns
    for (const [errorType, pattern] of Object.entries(this.ERROR_PATTERNS)) {
      const match = output.match(pattern);
      if (match) {
        return this.createSpecificError(errorType, match, operation);
      }
    }

    // Generic error fallback
    return new APIError(
      `Operation failed: ${output.trim() || 'Unknown error'}`,
      'SAMBA_ERROR',
      { operation, output }
    );
  }

  private static createSpecificError(errorType: string, match: RegExpMatchArray, operation?: string): APIError {
    const [fullMatch, ...groups] = match;
    
    switch (errorType) {
      case 'USER_EXISTS':
        return new ConflictError(`User '${groups[0]}' already exists`);
      
      case 'USER_NOT_FOUND':
        return new NotFoundError('User', groups[0]);
      
      case 'GROUP_EXISTS':
        return new ConflictError(`Group '${groups[0]}' already exists`);
      
      case 'GROUP_NOT_FOUND':
        return new NotFoundError('Group', groups[0]);
      
      case 'COMPUTER_EXISTS':
        return new ConflictError(`Computer '${groups[0]}' already exists`);
      
      case 'COMPUTER_NOT_FOUND':
        return new NotFoundError('Computer', groups[0]);
      
      case 'INVALID_PASSWORD':
        return new ValidationError('Password does not meet complexity requirements', 'password');
      
      case 'ACCESS_DENIED':
        return new AuthorizationError('Insufficient privileges to perform this operation');
      
      case 'DOMAIN_CONTROLLER_UNREACHABLE':
        return new NetworkError('Unable to connect to domain controller');
      
      case 'INVALID_CREDENTIALS':
        return new AuthenticationError('Invalid credentials provided');
      
      case 'SYNTAX_ERROR':
        return new ValidationError('Invalid syntax in command parameters');
      
      default:
        return new APIError(fullMatch, errorType, { operation });
    }
  }
}

// Error Handler Hook Utility
export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  rethrow?: boolean;
}

export class ErrorHandler {
  static handle(
    error: unknown, 
    context?: string, 
    options: ErrorHandlerOptions = {}
  ): APIError {
    const { showToast = true, logError = true, rethrow = false } = options;
    
    let apiError: APIError;
    
    if (error instanceof APIError) {
      apiError = error;
    } else if (error instanceof Error) {
      apiError = new APIError(error.message, 'UNKNOWN_ERROR', error);
    } else if (typeof error === 'string') {
      apiError = new APIError(error, 'STRING_ERROR');
    } else {
      apiError = new APIError('An unknown error occurred', 'UNKNOWN_ERROR', error);
    }

    if (logError) {
      console.error(`[${context || 'ErrorHandler'}]:`, {
        error: apiError.toJSON(),
        originalError: error,
        stack: apiError.stack,
      });
    }

    if (showToast) {
      // This would integrate with your toast system
      // toast.error(apiError.message);
    }

    if (rethrow) {
      throw apiError;
    }

    return apiError;
  }

  static isRetryableError(error: APIError): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'DOMAIN_CONTROLLER_UNREACHABLE'
    ];
    
    return retryableCodes.includes(error.code || '') || 
           (error.statusCode && error.statusCode >= 500);
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof APIError) {
      return error.message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'An unknown error occurred';
  }
}

// Retry Utility
export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: APIError) => boolean;
}

export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoffFactor = 2,
      shouldRetry = ErrorHandler.isRetryableError,
    } = options;

    let lastError: APIError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const apiError = ErrorHandler.handle(error, 'RetryHandler', { 
          showToast: false, 
          rethrow: false 
        });
        
        lastError = apiError;
        
        if (attempt === maxAttempts || !shouldRetry(apiError)) {
          throw apiError;
        }
        
        // Wait before retrying with exponential backoff
        const waitTime = delay * Math.pow(backoffFactor, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw lastError!;
  }
}
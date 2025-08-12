# Component Migration Guide

## Overview

This guide provides step-by-step instructions for migrating individual JavaScript components to TypeScript with Shadcn/ui and Tailwind CSS.

## Migration Checklist

### Pre-Migration Assessment
- [ ] Identify all dependencies (PatternFly imports, custom styles)
- [ ] Map existing functionality to Shadcn/ui components  
- [ ] Document current API calls and data flow
- [ ] Check for shared utilities that need TypeScript conversion
- [ ] Review test coverage (if exists)

### Migration Steps
1. [Create TypeScript interfaces](#1-typescript-interfaces)
2. [Replace UI components](#2-ui-component-replacement) 
3. [Update API calls](#3-api-modernization)
4. [Implement form handling](#4-form-handling)
5. [Add error handling](#5-error-handling)
6. [Write tests](#6-testing)
7. [Performance optimization](#7-performance-optimization)

## 1. TypeScript Interfaces

### Before: JavaScript Component
```javascript
// user/create.js
import React, { useState } from 'react';
import { Modal, Button, TextInput, Form } from '@patternfly/react-core';

export default function Create(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    // ...
}
```

### After: TypeScript Component
```typescript
// user/components/CreateUserDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Define clear interfaces
interface CreateUserDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onUserCreated?: (user: User) => void;
}

interface CreateUserFormData {
  username: string;
  password: string;
  email?: string;
  groups?: string[];
}

interface User {
  username: string;
  email?: string;
  enabled: boolean;
  groups: string[];
  createdAt: Date;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  isOpen = false,
  onClose,
  onUserCreated
}) => {
  const [formData, setFormData] = useState<CreateUserFormData>({
    username: '',
    password: '',
    email: '',
    groups: []
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Component implementation...
};
```

## 2. UI Component Replacement

### PatternFly → Shadcn/ui Mapping

| PatternFly Component | Shadcn/ui Equivalent | Notes |
|---------------------|---------------------|-------|
| `Modal` | `Dialog` | Use DialogContent, DialogHeader |
| `Button` | `Button` | Similar API, different variants |
| `TextInput` | `Input` | Simplified props |
| `Form`, `FormGroup` | `Form`, `FormField` | Use with react-hook-form |
| `Alert` | `Alert` | Different structure |
| `Card` | `Card` | Use CardContent, CardHeader |
| `Table` | `Table` | More semantic structure |
| `Dropdown` | `DropdownMenu` | Different component structure |
| `Select` | `Select` | Use SelectContent, SelectItem |
| `Toolbar` | Custom component | Build with flex utilities |
| `Pagination` | Custom component | Build with Button components |
| `Spinner` | `Progress` or custom | Use for loading states |

### Example: Modal → Dialog Migration

#### Before (PatternFly)
```javascript
<Modal
  variant={ModalVariant.medium}
  title="Create User"
  isOpen={isModalOpen}
  onClose={handleModalToggle}
  actions={[
    <Button key="confirm" variant="primary" onClick={handleSubmit}>
      Create
    </Button>,
    <Button key="cancel" variant="link" onClick={handleModalToggle}>
      Cancel
    </Button>
  ]}
>
  <Form>
    <FormGroup label="Username" fieldId="username">
      <TextInput
        type="text"
        id="username"
        value={username}
        onChange={setUsername}
      />
    </FormGroup>
  </Form>
</Modal>
```

#### After (Shadcn/ui)
```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Create User</DialogTitle>
      <DialogDescription>
        Create a new user account. All fields are required.
      </DialogDescription>
    </DialogHeader>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner className="mr-2" /> : null}
            Create User
          </Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

## 3. API Modernization

### Before: Direct cockpit.spawn Usage
```javascript
const handleSubmit = () => {
    setLoading(true);
    const cmd = ["samba-tool", "user", "create", username, password];
    cockpit.spawn(cmd, { superuser: true, err: "message" })
        .then((data) => {
            setSuccessMessage(data);
            setLoading(false);
        })
        .catch((exception) => {
            setErrorMessage(exception.message);
            setLoading(false);
        });
};
```

### After: Service Layer with TypeScript
```typescript
// services/user-api.ts
export class UserAPI {
  static async create(userData: CreateUserInput): Promise<User> {
    try {
      const command = ['samba-tool', 'user', 'create', userData.username, userData.password];
      
      if (userData.email) {
        command.push('--mail-address', userData.email);
      }
      
      const output = await cockpit.spawn(command, { 
        superuser: true, 
        err: "message" 
      });
      
      // Parse the output and return structured data
      return this.parseCreateOutput(output, userData.username);
    } catch (error) {
      throw new APIError(
        `Failed to create user: ${error.message}`,
        'USER_CREATE_FAILED',
        error
      );
    }
  }

  private static parseCreateOutput(output: string, username: string): User {
    // Parse samba-tool output into User object
    return {
      username,
      enabled: true,
      groups: [],
      createdAt: new Date()
    };
  }
}

// hooks/useUserMutations.ts
export const useUserMutations = () => {
  const { refresh } = useUsers();
  
  const create = useMutation({
    mutationFn: UserAPI.create,
    onSuccess: (newUser) => {
      // Update cache or refresh data
      refresh();
      toast.success(`User ${newUser.username} created successfully`);
    },
    onError: (error: APIError) => {
      toast.error(error.message);
    }
  });

  return { create };
};

// Component usage
const { create } = useUserMutations();

const onSubmit = async (data: CreateUserFormData) => {
  try {
    await create.mutateAsync(data);
    setIsOpen(false);
    form.reset();
  } catch (error) {
    // Error is handled by the hook
  }
};
```

## 4. Form Handling

### Before: Manual Form State
```javascript
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [email, setEmail] = useState("");
const [errors, setErrors] = useState({});

const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (!password || password.length < 8) newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

const handleSubmit = () => {
    if (!validateForm()) return;
    // Submit logic
};
```

### After: React Hook Form + Zod
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createUserSchema = z.object({
  username: z.string()
    .min(1, "Username is required")
    .max(64, "Username must be less than 64 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  email: z.string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  groups: z.array(z.string()).optional()
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export const CreateUserDialog: React.FC = () => {
  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
      groups: []
    }
  });

  const { create } = useUserMutations();

  const onSubmit = async (data: CreateUserFormData) => {
    await create.mutateAsync(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>
                Username can only contain letters, numbers, underscores, and hyphens.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter password" {...field} />
              </FormControl>
              <FormDescription>
                Password must be at least 8 characters with uppercase, lowercase, and numbers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={create.isPending}>
          {create.isPending && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
          Create User
        </Button>
      </form>
    </Form>
  );
};
```

## 5. Error Handling

### Before: Basic Error States
```javascript
const [errorMessage, setErrorMessage] = useState();
const [errorAlertVisible, setErrorAlertVisible] = useState(false);

// In component
{errorAlertVisible && <ErrorToast errorMessage={errorMessage} closeModal={() => setErrorAlertVisible(false)} />}
```

### After: Comprehensive Error Handling
```typescript
// types/errors.ts
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

// components/ui/error-alert.tsx
interface ErrorAlertProps {
  error: Error | APIError | null;
  onDismiss?: () => void;
  title?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  error, 
  onDismiss, 
  title = "Error" 
}) => {
  if (!error) return null;

  const isAPIError = error instanceof APIError;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {error.message}
        {isAPIError && error.code && (
          <div className="mt-2 text-sm text-muted-foreground">
            Error Code: {error.code}
          </div>
        )}
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="absolute top-2 right-2"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
};

// hooks/useErrorHandler.ts
export const useErrorHandler = () => {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof APIError) {
      setError(error);
      toast.error(error.message);
    } else if (error instanceof Error) {
      setError(error);
      toast.error(error.message);
    } else {
      const genericError = new Error('An unexpected error occurred');
      setError(genericError);
      toast.error(genericError.message);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};

// Component usage
const CreateUserDialog: React.FC = () => {
  const { error, handleError, clearError } = useErrorHandler();
  const { create } = useUserMutations();

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      clearError();
      await create.mutateAsync(data);
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <Dialog>
      <DialogContent>
        <ErrorAlert error={error} onDismiss={clearError} />
        {/* Form content */}
      </DialogContent>
    </Dialog>
  );
};
```

## 6. Testing

### Component Testing Template
```typescript
// __tests__/CreateUserDialog.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateUserDialog } from '../components/CreateUserDialog';
import { UserAPI } from '../services/user-api';

// Mock the API
jest.mock('../services/user-api');
const mockUserAPI = jest.mocked(UserAPI);

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('CreateUserDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields correctly', () => {
    render(<CreateUserDialog isOpen={true} />);
    
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create User' })).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<CreateUserDialog isOpen={true} />);
    
    const submitButton = screen.getByRole('button', { name: 'Create User' });
    await user.click(submitButton);
    
    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it('should validate username format', async () => {
    const user = userEvent.setup();
    render(<CreateUserDialog isOpen={true} />);
    
    const usernameInput = screen.getByLabelText('Username');
    await user.type(usernameInput, 'invalid user name!');
    
    const submitButton = screen.getByRole('button', { name: 'Create User' });
    await user.click(submitButton);
    
    expect(screen.getByText(/Username can only contain letters, numbers, underscores, and hyphens/)).toBeInTheDocument();
  });

  it('should create user successfully', async () => {
    const user = userEvent.setup();
    const mockUser = { username: 'testuser', enabled: true, groups: [], createdAt: new Date() };
    
    mockUserAPI.create.mockResolvedValue(mockUser);
    
    const onUserCreated = jest.fn();
    render(<CreateUserDialog isOpen={true} onUserCreated={onUserCreated} />);
    
    // Fill form
    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'TestPassword123');
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    
    // Submit
    const submitButton = screen.getByRole('button', { name: 'Create User' });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockUserAPI.create).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'TestPassword123',
        email: 'test@example.com',
        groups: []
      });
    });
    
    expect(onUserCreated).toHaveBeenCalledWith(mockUser);
  });

  it('should handle API errors', async () => {
    const user = userEvent.setup();
    const error = new APIError('User already exists', 'USER_EXISTS');
    
    mockUserAPI.create.mockRejectedValue(error);
    
    render(<CreateUserDialog isOpen={true} />);
    
    // Fill and submit form
    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'TestPassword123');
    await user.click(screen.getByRole('button', { name: 'Create User' }));
    
    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });
});
```

### API Testing Template
```typescript
// __tests__/user-api.test.ts
import { UserAPI } from '../services/user-api';
import cockpit from 'cockpit';

jest.mock('cockpit');
const mockCockpit = jest.mocked(cockpit);

describe('UserAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create user with basic information', async () => {
      mockCockpit.spawn.mockResolvedValue('User created successfully');
      
      const userData = {
        username: 'testuser',
        password: 'testpass123'
      };
      
      await UserAPI.create(userData);
      
      expect(mockCockpit.spawn).toHaveBeenCalledWith(
        ['samba-tool', 'user', 'create', 'testuser', 'testpass123'],
        { superuser: true, err: 'message' }
      );
    });

    it('should create user with email', async () => {
      mockCockpit.spawn.mockResolvedValue('User created successfully');
      
      const userData = {
        username: 'testuser',
        password: 'testpass123',
        email: 'test@example.com'
      };
      
      await UserAPI.create(userData);
      
      expect(mockCockpit.spawn).toHaveBeenCalledWith(
        ['samba-tool', 'user', 'create', 'testuser', 'testpass123', '--mail-address', 'test@example.com'],
        { superuser: true, err: 'message' }
      );
    });

    it('should handle creation errors', async () => {
      const error = new Error('User already exists');
      mockCockpit.spawn.mockRejectedValue(error);
      
      const userData = {
        username: 'testuser',
        password: 'testpass123'
      };
      
      await expect(UserAPI.create(userData)).rejects.toThrow('Failed to create user: User already exists');
    });
  });
});
```

## 7. Performance Optimization

### Code Splitting
```typescript
// Lazy load dialogs and heavy components
const CreateUserDialog = lazy(() => import('./components/CreateUserDialog'));
const EditUserDialog = lazy(() => import('./components/EditUserDialog'));

const UserManagement: React.FC = () => {
  return (
    <div>
      <Suspense fallback={<Skeleton className="w-full h-64" />}>
        {showCreateDialog && <CreateUserDialog />}
        {showEditDialog && <EditUserDialog />}
      </Suspense>
    </div>
  );
};
```

### Memoization
```typescript
// Memoize expensive calculations
const UserTable: React.FC<UserTableProps> = ({ users, filters }) => {
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      return filters.every(filter => filter.predicate(user));
    });
  }, [users, filters]);

  const columns = useMemo(() => [
    { key: 'username', header: 'Username' },
    { key: 'email', header: 'Email' },
    { key: 'enabled', header: 'Status' }
  ], []);

  return <DataTable data={filteredUsers} columns={columns} />;
};
```

### Virtual Scrolling for Large Lists
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualUserList: React.FC<{ users: User[] }> = ({ users }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Row height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <UserRow
            key={virtualItem.key}
            user={users[virtualItem.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

## Common Migration Patterns

### 1. List Components
```typescript
// Pattern for migrating list components
interface ListProps<T> {
  data: T[];
  loading?: boolean;
  error?: string | null;
  onItemSelect?: (item: T) => void;
  onItemDelete?: (id: string) => void;
  renderActions?: (item: T) => React.ReactNode;
}

const GenericList = <T extends { id: string; name: string }>({
  data,
  loading = false,
  error = null,
  onItemSelect,
  onItemDelete,
  renderActions
}: ListProps<T>) => {
  if (loading) return <Skeleton className="w-full h-32" />;
  if (error) return <ErrorAlert error={new Error(error)} />;
  if (data.length === 0) return <EmptyState message="No items found" />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id} onClick={() => onItemSelect?.(item)}>
            <TableCell>{item.name}</TableCell>
            <TableCell>
              {renderActions?.(item)}
              {onItemDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemDelete(item.id);
                  }}
                >
                  Delete
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

### 2. Confirmation Dialogs
```typescript
// Reusable confirmation dialog pattern
interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

This migration guide provides comprehensive patterns for converting legacy JavaScript components to modern TypeScript components with Shadcn/ui and proper error handling, testing, and performance optimization.
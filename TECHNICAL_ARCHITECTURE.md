# Technical Architecture Guide

## Overview

This document details the technical architecture for the modernized Samba AD DC management interface, outlining the technology stack, patterns, and implementation guidelines.

## Technology Stack

### Core Technologies
- **React 18.3.1**: UI framework with concurrent features
- **TypeScript 5.6+**: Type-safe JavaScript with strict mode
- **Tailwind CSS 3.4+**: Utility-first CSS framework
- **Shadcn/ui**: React component library built on Radix UI
- **Webpack 5**: Module bundler with advanced optimization

### Development Tools
- **ESLint**: Code linting with TypeScript rules
- **Jest + React Testing Library**: Testing framework
- **React Hook Form**: Form management
- **Zod**: Runtime type validation
- **Cockpit API**: System integration layer

## Application Architecture

### Directory Structure
```
src/
├── components/                 # Shared UI components
│   ├── ui/                    # Shadcn/ui components
│   ├── layout/                # Layout components
│   └── common/                # Shared business components
├── modules/                   # Feature modules
│   ├── user/
│   ├── computer/
│   ├── domain/
│   └── [module]/
│       ├── components/        # Module-specific components
│       ├── hooks/            # Custom React hooks
│       ├── services/         # API services
│       ├── types/            # TypeScript types
│       ├── __tests__/        # Tests
│       └── index.tsx         # Module entry
├── shared/                    # Shared utilities
│   ├── services/             # Global services
│   ├── hooks/                # Shared hooks
│   ├── types/                # Global types
│   └── utils/                # Utility functions
├── lib/                      # External integrations
│   └── utils.ts              # Tailwind utilities
└── app.tsx                   # Root application
```

### Component Hierarchy
```
App
├── Router
│   ├── Layout
│   │   ├── Navigation
│   │   ├── Breadcrumbs
│   │   └── MainContent
│   │       └── ModulePages
│   │           ├── ListView
│   │           ├── CreateDialog
│   │           ├── EditDialog
│   │           └── DeleteDialog
│   └── ErrorBoundary
└── GlobalProviders
    ├── ThemeProvider
    ├── ToastProvider
    └── AuthProvider
```

## Design Patterns

### 1. Module Pattern
Each functional area is organized as a self-contained module:

```typescript
// Module structure
export interface ModuleStructure {
  components: React.ComponentType[];
  hooks: CustomHook[];
  services: APIService[];
  types: TypeDefinition[];
}

// Example: User module
const UserModule: ModuleStructure = {
  components: [UserList, CreateUser, UserDetails],
  hooks: [useUsers, useUserMutations],
  services: [UserAPI],
  types: [User, CreateUserInput, UpdateUserInput]
};
```

### 2. Custom Hooks Pattern
Business logic is extracted into reusable hooks:

```typescript
// Data fetching hook
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await UserAPI.list();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { users, loading, error, refresh };
};

// Mutations hook
export const useUserMutations = () => {
  const { refresh } = useUsers();
  
  const create = useCallback(async (data: CreateUserInput) => {
    await UserAPI.create(data);
    await refresh();
  }, [refresh]);

  const deleteUser = useCallback(async (id: string) => {
    await UserAPI.delete(id);
    await refresh();
  }, [refresh]);

  return { create, delete: deleteUser };
};
```

### 3. Service Layer Pattern
API calls are abstracted into service classes:

```typescript
export class UserAPI {
  private static async executeCommand(command: string[]): Promise<string> {
    return cockpit.spawn(command, { superuser: true, err: "message" });
  }

  static async list(): Promise<User[]> {
    const output = await this.executeCommand(['samba-tool', 'user', 'list']);
    return this.parseUserList(output);
  }

  static async create(data: CreateUserInput): Promise<User> {
    const command = ['samba-tool', 'user', 'create', data.username, data.password];
    await this.executeCommand(command);
    return this.show(data.username);
  }

  static async delete(username: string): Promise<void> {
    await this.executeCommand(['samba-tool', 'user', 'delete', username]);
  }

  private static parseUserList(output: string): User[] {
    // Parse samba-tool output into User objects
  }
}
```

### 4. Form Handling Pattern
Forms use React Hook Form + Zod for validation:

```typescript
const createUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  email: z.string().email().optional(),
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
    try {
      await create(data);
      form.reset();
      // Show success toast
    } catch (error) {
      // Show error toast
    }
  };

  return (
    <Dialog>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Other form fields */}
            <Button type="submit">Create User</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
```

## State Management

### Local State Strategy
- **Component State**: `useState` for simple local state
- **Form State**: React Hook Form for complex forms
- **Server State**: Custom hooks with proper caching

### Global State Strategy
For application-wide state, use React Context:

```typescript
interface AppContextType {
  user: AuthenticatedUser | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  notifications: Notification[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Context value and providers
  return (
    <AppContext.Provider value={{ user, connectionStatus, notifications }}>
      {children}
    </AppContext.Provider>
  );
};
```

## API Integration

### Cockpit Integration Pattern
```typescript
// Base API service
export abstract class BaseAPI {
  protected static async executeCommand(
    command: string[],
    options: { timeout?: number; input?: string } = {}
  ): Promise<string> {
    try {
      return await cockpit.spawn(command, {
        superuser: true,
        err: "message",
        ...options
      });
    } catch (error) {
      throw new APIError(error.message || 'Command execution failed');
    }
  }

  protected static parseOutput<T>(
    output: string,
    parser: (line: string) => T | null
  ): T[] {
    return output
      .split('\n')
      .map(parser)
      .filter((item): item is T => item !== null);
  }
}

// Specific API implementation
export class UserAPI extends BaseAPI {
  static async list(): Promise<User[]> {
    const output = await this.executeCommand(['samba-tool', 'user', 'list']);
    return this.parseOutput(output, this.parseUserLine);
  }

  private static parseUserLine(line: string): User | null {
    if (!line.trim()) return null;
    
    const [username, ...rest] = line.split('\t');
    return {
      username: username.trim(),
      // Parse additional user properties
    };
  }
}
```

### Error Handling Strategy
```typescript
export class APIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Error boundary for API errors
export const APIErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <div className="p-4 border border-destructive rounded-md">
          <h3 className="text-lg font-semibold text-destructive">API Error</h3>
          <p className="mt-2">{error.message}</p>
          <Button onClick={resetErrorBoundary} className="mt-4">
            Retry
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
```

## Component Design Guidelines

### 1. Component Composition
Favor composition over inheritance:

```typescript
// Good: Composable components
const UserManagement: React.FC = () => (
  <div className="space-y-4">
    <UserToolbar>
      <CreateUserDialog />
      <BulkActions />
    </UserToolbar>
    <UserTable />
    <UserPagination />
  </div>
);

// Instead of monolithic components
```

### 2. Props Interface Design
Use clear, specific prop interfaces:

```typescript
interface UserTableProps {
  users: User[];
  loading?: boolean;
  error?: string | null;
  onUserSelect?: (user: User) => void;
  onUserDelete?: (userId: string) => void;
  selectedUsers?: string[];
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading = false,
  error = null,
  onUserSelect,
  onUserDelete,
  selectedUsers = []
}) => {
  // Component implementation
};
```

### 3. Accessibility Standards
Follow WCAG 2.1 AA guidelines:

```typescript
const DeleteConfirmationDialog: React.FC<DeleteConfirmationProps> = ({ 
  isOpen, 
  username, 
  onConfirm, 
  onCancel 
}) => (
  <AlertDialog open={isOpen} onOpenChange={onCancel}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete User</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete user "{username}"? 
          This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction 
          onClick={onConfirm}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Delete User
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
```

## Performance Considerations

### 1. Code Splitting
```typescript
// Lazy load modules
const UserManagement = lazy(() => import('./modules/user'));
const ComputerManagement = lazy(() => import('./modules/computer'));

const App: React.FC = () => (
  <Router>
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/users" element={<UserManagement />} />
        <Route path="/computers" element={<ComputerManagement />} />
      </Routes>
    </Suspense>
  </Router>
);
```

### 2. Data Optimization
```typescript
// Virtual scrolling for large lists
const VirtualizedUserList: React.FC<{ users: User[] }> = ({ users }) => {
  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <UserRow
            key={virtualRow.key}
            user={users[virtualRow.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

### 3. Memory Management
```typescript
// Proper cleanup in hooks
const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const abortControllerRef = useRef<AbortController>();

  const fetchUsers = useCallback(async () => {
    // Cancel previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const data = await UserAPI.list();
      setUsers(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error.message);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { users, fetchUsers };
};
```

## Security Implementation

### 1. Input Sanitization
```typescript
// Validation schemas with sanitization
const userInputSchema = z.object({
  username: z.string()
    .min(1, "Username is required")
    .max(64, "Username too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid username format"),
  email: z.string()
    .email("Invalid email format")
    .transform(email => email.toLowerCase().trim())
});
```

### 2. XSS Prevention
```typescript
// Safe HTML rendering
const SafeHTML: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedContent = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};
```

### 3. API Security
```typescript
// Command injection prevention
class SecureAPI {
  private static sanitizeCommand(args: string[]): string[] {
    return args.map(arg => {
      // Remove dangerous characters
      return arg.replace(/[;&|`$(){}[\]]/g, '');
    });
  }

  protected static async executeCommand(command: string[]): Promise<string> {
    const sanitizedCommand = this.sanitizeCommand(command);
    return cockpit.spawn(sanitizedCommand, { superuser: true, err: "message" });
  }
}
```

## Testing Architecture

### 1. Unit Testing Strategy
```typescript
// Component testing
describe('CreateUserDialog', () => {
  it('should validate form inputs', async () => {
    render(<CreateUserDialog />);
    
    const usernameInput = screen.getByLabelText('Username');
    const submitButton = screen.getByRole('button', { name: 'Create User' });
    
    // Test validation
    fireEvent.click(submitButton);
    expect(screen.getByText('Username is required')).toBeInTheDocument();
    
    // Test valid input
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
  });
});
```

### 2. Integration Testing
```typescript
// API integration testing
describe('UserAPI', () => {
  beforeEach(() => {
    jest.mocked(cockpit.spawn).mockClear();
  });

  it('should create user successfully', async () => {
    jest.mocked(cockpit.spawn).mockResolvedValue('User created successfully');
    
    const result = await UserAPI.create({
      username: 'testuser',
      password: 'testpassword'
    });
    
    expect(cockpit.spawn).toHaveBeenCalledWith(
      ['samba-tool', 'user', 'create', 'testuser', 'testpassword'],
      { superuser: true, err: 'message' }
    );
  });
});
```

## Build Configuration

### Webpack Optimization
```javascript
// webpack.config.js optimizations
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
    },
  },
};
```

This architecture provides a solid foundation for the modernized Samba AD DC management interface, ensuring scalability, maintainability, and performance.
# Testing Strategy for Samba AD DC Migration

## Overview

This document outlines the comprehensive testing strategy for achieving 100% test coverage during the migration from JavaScript/PatternFly to TypeScript/Shadcn/ui.

## Testing Pyramid

```
                   E2E Tests (5%)
                Critical user workflows
                Cross-browser testing
                 Real API integration

              Integration Tests (25%)
              Component + API interactions
              User workflow testing
              Context/state management

            Unit Tests (70%)
            Individual components
            Utility functions
            API services
            Custom hooks
```

## Test Configuration

### Jest Setup
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
};
```

### Test Setup
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Mock Cockpit API
global.cockpit = {
  spawn: jest.fn(),
  script: jest.fn(),
  file: jest.fn(),
  // Add other cockpit methods as needed
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Start MSW server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Unit Testing

### 1. Component Testing

#### Basic Component Test Template
```typescript
// __tests__/UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCard } from '../components/UserCard';
import type { User } from '../types';

const mockUser: User = {
  username: 'testuser',
  email: 'test@example.com',
  enabled: true,
  groups: ['Users'],
  createdAt: new Date('2024-01-01'),
};

describe('UserCard', () => {
  it('should render user information correctly', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('should show disabled status for disabled users', () => {
    const disabledUser = { ...mockUser, enabled: false };
    render(<UserCard user={disabledUser} />);
    
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const onEdit = jest.fn();
    const user = userEvent.setup();
    
    render(<UserCard user={mockUser} onEdit={onEdit} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);
    
    expect(onEdit).toHaveBeenCalledWith(mockUser);
  });

  it('should be accessible', () => {
    const { container } = render(<UserCard user={mockUser} />);
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { name: 'testuser' })).toBeInTheDocument();
    
    // Check for proper labeling
    expect(screen.getByLabelText('User status')).toBeInTheDocument();
    
    // Ensure no accessibility violations
    // You can use jest-axe for more comprehensive a11y testing
  });
});
```

#### Form Component Testing
```typescript
// __tests__/CreateUserForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateUserForm } from '../components/CreateUserForm';

// Mock the API
jest.mock('../services/user-api');

describe('CreateUserForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<CreateUserForm onSuccess={jest.fn()} />);
    
    const submitButton = screen.getByRole('button', { name: /create user/i });
    await user.click(submitButton);
    
    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
  });

  it('should validate username format', async () => {
    const user = userEvent.setup();
    render(<CreateUserForm onSuccess={jest.fn()} />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(usernameInput, 'invalid username!');
    await user.tab(); // Trigger validation
    
    expect(screen.getByText(/username can only contain/i)).toBeInTheDocument();
  });

  it('should validate password strength', async () => {
    const user = userEvent.setup();
    render(<CreateUserForm onSuccess={jest.fn()} />);
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.type(passwordInput, 'weak');
    await user.tab();
    
    expect(screen.getByText(/password must contain/i)).toBeInTheDocument();
  });

  it('should submit valid form data', async () => {
    const mockOnSuccess = jest.fn();
    const user = userEvent.setup();
    
    render(<CreateUserForm onSuccess={mockOnSuccess} />);
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/username/i), 'validuser');
    await user.type(screen.getByLabelText(/^password$/i), 'ValidPass123');
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    
    const submitButton = screen.getByRole('button', { name: /create user/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockError = new Error('User already exists');
    jest.mocked(UserAPI.create).mockRejectedValue(mockError);
    
    const user = userEvent.setup();
    render(<CreateUserForm onSuccess={jest.fn()} />);
    
    // Fill and submit form
    await user.type(screen.getByLabelText(/username/i), 'existinguser');
    await user.type(screen.getByLabelText(/^password$/i), 'ValidPass123');
    await user.click(screen.getByRole('button', { name: /create user/i }));
    
    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup();
    render(<CreateUserForm onSuccess={jest.fn()} />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(usernameInput, 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'ValidPass123');
    await user.click(screen.getByRole('button', { name: /create user/i }));
    
    await waitFor(() => {
      expect(usernameInput).toHaveValue('');
    });
  });
});
```

### 2. Custom Hooks Testing

```typescript
// __tests__/useUsers.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from '../hooks/useUsers';
import { UserAPI } from '../services/user-api';

jest.mock('../services/user-api');

const mockUsers = [
  { username: 'user1', enabled: true, groups: [], createdAt: new Date() },
  { username: 'user2', enabled: false, groups: ['Admins'], createdAt: new Date() },
];

describe('useUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch users on mount', async () => {
    jest.mocked(UserAPI.list).mockResolvedValue(mockUsers);
    
    const { result } = renderHook(() => useUsers());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.users).toEqual([]);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    const error = new Error('Failed to fetch users');
    jest.mocked(UserAPI.list).mockRejectedValue(error);
    
    const { result } = renderHook(() => useUsers());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe(error.message);
    expect(result.current.users).toEqual([]);
  });

  it('should refresh users when refresh is called', async () => {
    jest.mocked(UserAPI.list)
      .mockResolvedValueOnce([mockUsers[0]])
      .mockResolvedValueOnce(mockUsers);
    
    const { result } = renderHook(() => useUsers());
    
    await waitFor(() => {
      expect(result.current.users).toEqual([mockUsers[0]]);
    });
    
    await result.current.refresh();
    
    expect(result.current.users).toEqual(mockUsers);
  });
});
```

### 3. API Service Testing

```typescript
// __tests__/user-api.test.ts
import { UserAPI, APIError } from '../services/user-api';
import type { CreateUserInput } from '../types';

// Mock cockpit
const mockSpawn = jest.fn();
global.cockpit = { spawn: mockSpawn };

describe('UserAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should parse user list correctly', async () => {
      const mockOutput = 'user1\nuser2\nuser3\n';
      mockSpawn.mockResolvedValue(mockOutput);
      
      const users = await UserAPI.list();
      
      expect(mockSpawn).toHaveBeenCalledWith(
        ['samba-tool', 'user', 'list'],
        { superuser: true, err: 'message' }
      );
      
      expect(users).toHaveLength(3);
      expect(users[0].username).toBe('user1');
    });

    it('should handle empty list', async () => {
      mockSpawn.mockResolvedValue('');
      
      const users = await UserAPI.list();
      
      expect(users).toEqual([]);
    });

    it('should throw APIError on failure', async () => {
      const error = new Error('Command failed');
      mockSpawn.mockRejectedValue(error);
      
      await expect(UserAPI.list()).rejects.toThrow(APIError);
      await expect(UserAPI.list()).rejects.toThrow('Failed to list users');
    });
  });

  describe('create', () => {
    const userData: CreateUserInput = {
      username: 'newuser',
      password: 'password123',
      email: 'new@example.com'
    };

    it('should create user with basic info', async () => {
      mockSpawn.mockResolvedValue('User created successfully');
      
      await UserAPI.create({ username: 'newuser', password: 'password123' });
      
      expect(mockSpawn).toHaveBeenCalledWith(
        ['samba-tool', 'user', 'create', 'newuser', 'password123'],
        { superuser: true, err: 'message' }
      );
    });

    it('should create user with email', async () => {
      mockSpawn.mockResolvedValue('User created successfully');
      
      await UserAPI.create(userData);
      
      expect(mockSpawn).toHaveBeenCalledWith(
        ['samba-tool', 'user', 'create', 'newuser', 'password123', '--mail-address', 'new@example.com'],
        { superuser: true, err: 'message' }
      );
    });

    it('should sanitize input parameters', async () => {
      mockSpawn.mockResolvedValue('User created successfully');
      
      const maliciousData = {
        username: 'user; rm -rf /',
        password: 'pass`whoami`'
      };
      
      await UserAPI.create(maliciousData);
      
      // Verify that dangerous characters are removed/escaped
      const calledArgs = mockSpawn.mock.calls[0][0];
      expect(calledArgs[2]).toBe('user rm -rf /');
      expect(calledArgs[3]).toBe('passwhoami');
    });

    it('should handle creation errors', async () => {
      const error = new Error('User already exists');
      mockSpawn.mockRejectedValue(error);
      
      await expect(UserAPI.create(userData)).rejects.toThrow(APIError);
      await expect(UserAPI.create(userData)).rejects.toThrow('Failed to create user');
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      mockSpawn.mockResolvedValue('User deleted successfully');
      
      await UserAPI.delete('testuser');
      
      expect(mockSpawn).toHaveBeenCalledWith(
        ['samba-tool', 'user', 'delete', 'testuser'],
        { superuser: true, err: 'message' }
      );
    });

    it('should handle deletion errors', async () => {
      const error = new Error('User not found');
      mockSpawn.mockRejectedValue(error);
      
      await expect(UserAPI.delete('nonexistent')).rejects.toThrow(APIError);
    });
  });
});
```

## Integration Testing

### Component + API Integration
```typescript
// __tests__/integration/UserManagement.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserManagement } from '../components/UserManagement';
import { server } from '../../test/mocks/server';
import { rest } from 'msw';

// Mock successful API responses
const mockUsers = [
  { username: 'user1', enabled: true, groups: [], createdAt: new Date() },
  { username: 'user2', enabled: false, groups: ['Admins'], createdAt: new Date() },
];

describe('UserManagement Integration', () => {
  it('should load and display users on mount', async () => {
    render(<UserManagement />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
  });

  it('should create new user and refresh list', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Open create dialog
    const createButton = screen.getByRole('button', { name: /create user/i });
    await user.click(createButton);
    
    // Fill form
    await user.type(screen.getByLabelText(/username/i), 'newuser');
    await user.type(screen.getByLabelText(/^password$/i), 'NewPass123');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);
    
    // Wait for success and list refresh
    await waitFor(() => {
      expect(screen.getByText('newuser')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    // Override server handler to return error
    server.use(
      rest.post('/api/users', (req, res, ctx) => {
        return res(ctx.status(409), ctx.json({ error: 'User already exists' }));
      })
    );
    
    const user = userEvent.setup();
    render(<UserManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Try to create user
    await user.click(screen.getByRole('button', { name: /create user/i }));
    await user.type(screen.getByLabelText(/username/i), 'existinguser');
    await user.type(screen.getByLabelText(/^password$/i), 'Pass123');
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });

  it('should delete user with confirmation', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });
    
    // Click delete button
    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    await user.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);
    
    // Wait for user to be removed from list
    await waitFor(() => {
      expect(screen.queryByText('user1')).not.toBeInTheDocument();
    });
  });
});
```

## End-to-End Testing

### Playwright Setup
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples
```typescript
// e2e/user-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
  });

  test('should display user list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    
    // Wait for data to load
    await expect(page.getByText('Loading...')).not.toBeVisible();
    await expect(page.getByRole('row')).toHaveCount.toBeGreaterThan(1);
  });

  test('should create new user', async ({ page }) => {
    // Click create button
    await page.getByRole('button', { name: 'Create User' }).click();
    
    // Fill form
    await page.getByLabel('Username').fill('e2etest');
    await page.getByLabel('Password', { exact: true }).fill('TestPass123');
    await page.getByLabel('Email').fill('e2e@example.com');
    
    // Submit
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify success
    await expect(page.getByText('User created successfully')).toBeVisible();
    await expect(page.getByText('e2etest')).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.getByRole('button', { name: 'Create User' }).click();
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Check validation messages
    await expect(page.getByText('Username is required')).toBeVisible();
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
    
    // Test invalid email
    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Password', { exact: true }).fill('short');
    
    await expect(page.getByText('Invalid email address')).toBeVisible();
    await expect(page.getByText('Password must contain')).toBeVisible();
  });

  test('should delete user with confirmation', async ({ page }) => {
    // Ensure test user exists (could be setup in beforeEach)
    await createTestUser(page, 'deletetest');
    
    // Find and click delete button
    const userRow = page.getByRole('row').filter({ hasText: 'deletetest' });
    await userRow.getByRole('button', { name: 'Delete' }).click();
    
    // Confirm deletion
    await expect(page.getByText('Are you sure you want to delete')).toBeVisible();
    await page.getByRole('button', { name: 'Delete User' }).click();
    
    // Verify user is removed
    await expect(page.getByText('User deleted successfully')).toBeVisible();
    await expect(userRow).not.toBeVisible();
  });

  test('should handle network errors', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/**', route => route.abort());
    
    await page.reload();
    
    // Should show error state
    await expect(page.getByText('Failed to load users')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    // Basic accessibility checks
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Create User' })).toBeFocused();
    
    // Check for proper ARIA labels
    await expect(page.getByRole('table')).toHaveAttribute('aria-label');
  });
});

async function createTestUser(page, username: string) {
  await page.getByRole('button', { name: 'Create User' }).click();
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill('TestPass123');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('User created successfully')).toBeVisible();
}
```

## Performance Testing

### Load Testing with React Testing Library
```typescript
// __tests__/performance/large-dataset.test.tsx
import { render, screen } from '@testing-library/react';
import { UserTable } from '../components/UserTable';

describe('UserTable Performance', () => {
  it('should handle large datasets efficiently', () => {
    // Generate large dataset
    const largeUserList = Array.from({ length: 10000 }, (_, i) => ({
      username: `user${i}`,
      email: `user${i}@example.com`,
      enabled: i % 2 === 0,
      groups: [`group${i % 10}`],
      createdAt: new Date(),
    }));

    const startTime = performance.now();
    
    render(<UserTable users={largeUserList} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within reasonable time (adjust based on requirements)
    expect(renderTime).toBeLessThan(1000); // 1 second
    
    // Should use virtualization for large lists
    const visibleRows = screen.getAllByRole('row');
    expect(visibleRows.length).toBeLessThan(100); // Only visible rows rendered
  });

  it('should debounce search input', async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup();
    
    render(<SearchInput onSearch={onSearch} debounceMs={300} />);
    
    const input = screen.getByLabelText(/search/i);
    
    // Type rapidly
    await user.type(input, 'quick');
    
    // Should not call immediately
    expect(onSearch).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('quick');
    }, { timeout: 500 });
    
    // Should only call once after debounce
    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});
```

## Visual Regression Testing

### Storybook + Chromatic Setup
```typescript
// .storybook/main.ts
export default {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
};

// src/components/UserCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { UserCard } from './UserCard';

const meta: Meta<typeof UserCard> = {
  title: 'Components/UserCard',
  component: UserCard,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    user: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof UserCard>;

export const Default: Story = {
  args: {
    user: {
      username: 'johndoe',
      email: 'john@example.com',
      enabled: true,
      groups: ['Users', 'Developers'],
      createdAt: new Date('2024-01-01'),
    },
  },
};

export const Disabled: Story = {
  args: {
    user: {
      username: 'janedoe',
      email: 'jane@example.com',
      enabled: false,
      groups: ['Users'],
      createdAt: new Date('2024-01-01'),
    },
  },
};

export const LongUsername: Story = {
  args: {
    user: {
      username: 'averylongusernamethatmightcauselayoutissues',
      email: 'long@example.com',
      enabled: true,
      groups: ['Users'],
      createdAt: new Date('2024-01-01'),
    },
  },
};
```

## Testing Utilities

### Custom Render Function
```typescript
// src/test/utils.tsx
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../components/theme-provider';
import { Toaster } from '../components/ui/toaster';

interface CustomRenderOptions {
  initialEntries?: string[];
  theme?: 'light' | 'dark';
}

function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { initialEntries = ['/'], theme = 'light' } = options;
  
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <ThemeProvider defaultTheme={theme}>
          {children}
          <Toaster />
        </ThemeProvider>
      </BrowserRouter>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
```

### Mock Factories
```typescript
// src/test/factories.ts
import { faker } from '@faker-js/faker';
import type { User, Group, Computer } from '../types';

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  username: faker.internet.userName(),
  email: faker.internet.email(),
  enabled: faker.datatype.boolean(),
  groups: [faker.lorem.word()],
  createdAt: faker.date.past(),
  ...overrides,
});

export const createMockUsers = (count: number = 5): User[] =>
  Array.from({ length: count }, () => createMockUser());

export const createMockGroup = (overrides: Partial<Group> = {}): Group => ({
  name: faker.lorem.word(),
  description: faker.lorem.sentence(),
  members: [faker.internet.userName()],
  groupType: faker.helpers.arrayElement(['Security', 'Distribution']),
  ...overrides,
});

export const createMockComputer = (overrides: Partial<Computer> = {}): Computer => ({
  name: faker.internet.domainName(),
  distinguishedName: faker.lorem.words(),
  enabled: faker.datatype.boolean(),
  operatingSystem: faker.helpers.arrayElement(['Windows 10', 'Windows Server 2019']),
  lastLogon: faker.date.recent(),
  ...overrides,
});
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run typecheck
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
      
      - name: Upload E2E test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

This comprehensive testing strategy ensures robust coverage and quality throughout the migration process, supporting the goal of 100% test coverage while maintaining high code quality standards.
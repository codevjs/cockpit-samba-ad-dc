# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modernized Cockpit plugin for managing Samba Active Directory Domain Controllers. Currently migrating from JavaScript/PatternFly to TypeScript/Tailwind CSS/Shadcn UI architecture.

## Development Commands

### Build & Development
```bash
# Development
npm run dev              # Vite dev server (fast HMR)
npm run watch           # Watch mode
make watch              # Alternative watch

# Build
npm run build           # Production build
npm run build:dev       # Development build
npm run build:user      # User-specific build
npm run build:test      # Test build
make                    # Full build via Makefile

# Installation
make install            # System installation
make devel-install      # Development installation (symlink to ~/.local/share/cockpit)
```

### Quality Assurance
```bash
# Linting
npm run lint            # Check code style
npm run lint:fix        # Auto-fix linting issues

# Type Checking
npm run typecheck       # TypeScript type checking

# Testing
npm run test            # Run tests
npm run test:watch      # Watch mode testing
npm run test:coverage   # Test with coverage report
```

## Architecture

### Technology Stack
- **Frontend**: React 18.3.1 + TypeScript 5.6+
- **UI**: Tailwind CSS 3.4+ + Shadcn/ui (Radix UI components)
- **Build**: Vite 7+ with multiple entry points (much faster than Webpack)
- **Testing**: Jest + React Testing Library
- **Forms**: React Hook Form + Zod validation
- **Integration**: Cockpit API for system management

### Migration Status
The project is **actively migrating** from legacy JavaScript/PatternFly to modern TypeScript/Shadcn stack:
- **Legacy files**: `.js` files with PatternFly components
- **Modern files**: `.tsx` files with Shadcn/ui + Tailwind
- **Mixed state**: Some modules partially migrated (e.g., `user/` module ~50% complete)

### Module Structure
16 core modules requiring management of AD DC components:

**High Priority Modules** (partially modernized):
- `user/` - User management (8 files, 50% migrated)
- `computer/` - Computer management (6 files)
- `group/` - Group management (6 files)
- `domain/` - Domain operations (15+ files, complex with `backup/` and `trust/` subdirectories)

**Standard Modules**:
- `dns/`, `gpo/`, `organization_unit/`, `contact/`, `delegation/`, `dsacl/`, `forest/`, `fsmo/`, `ntacl/`, `sites/`, `spn/`, `time/`

## Project Structure

```
src/
├── components/ui/           # Shadcn/ui components
├── [module]/               # Feature modules (user, computer, etc.)
│   ├── components/         # Modern: React components (.tsx)
│   ├── hooks/             # Modern: Custom hooks
│   ├── services/          # Modern: API services
│   ├── *.js               # Legacy: JavaScript files
│   └── *.html             # Legacy: HTML templates
├── lib/                   # Utilities
├── services/              # Shared API services
├── types/                 # TypeScript definitions
└── globals.css            # Tailwind CSS
```

### Path Aliases
- `@/*` → `src/*`
- `@/components/*` → `src/components/*`
- `@/lib/*` → `src/lib/*`

## Development Patterns

### Modern Component Pattern
```typescript
// Modern TypeScript component
export const UserList: React.FC = () => {
  const { users, loading, error } = useUsers();
  const { create, delete: deleteUser } = useUserMutations();
  
  return (
    <div className="space-y-4">
      <DataTable data={users} loading={loading} error={error} />
    </div>
  );
};
```

### API Service Pattern
```typescript
// Service layer with Cockpit integration
export class UserAPI {
  static async list(): Promise<User[]> {
    const output = await cockpit.spawn(['samba-tool', 'user', 'list'], {
      superuser: true, err: "message"
    });
    return this.parseUserList(output);
  }
}
```

### Form Handling Pattern
```typescript
// React Hook Form + Zod validation
const schema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(8, "Password too short")
});

const form = useForm({
  resolver: zodResolver(schema)
});
```

### Custom Hooks Pattern
```typescript
// Data fetching hooks
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  // Implementation...
};

export const useUserMutations = () => {
  const create = useCallback(async (data) => {
    await UserAPI.create(data);
  }, []);
  // Implementation...
};
```

## Testing Strategy

### Configuration
- **Framework**: Jest with jsdom environment
- **Testing Library**: React Testing Library
- **Setup**: `test/setupTests.ts`
- **Coverage**: Targets 100% coverage
- **Mocking**: Cockpit API mocked globally

### Test Structure
```
__tests__/
├── components/          # Component tests
├── hooks/              # Hook tests  
├── services/           # API tests
└── integration/        # Integration tests
```

## Build System

### Vite Configuration
- **Multiple entry points**: Each module has separate entry (faster than Webpack)
- **Code splitting**: Automatic smart chunking
- **CSS processing**: SCSS + PostCSS + Tailwind (built-in)
- **TypeScript**: Native TypeScript support
- **Development**: Lightning-fast HMR on port 9000

### Entry Points
Each module generates separate bundles:
- `index.js` - Main application
- `user/index.js` - User management
- `computer/index.js` - Computer management  
- etc.

## Migration Guidelines

### Converting Legacy Files
1. **Rename**: `.js` → `.tsx`
2. **Replace UI**: PatternFly → Shadcn/ui components
3. **Add Types**: Define TypeScript interfaces
4. **Extract Logic**: Move to custom hooks
5. **API Layer**: Create service classes
6. **Forms**: Use React Hook Form + Zod
7. **Testing**: Add comprehensive tests

### PatternFly → Shadcn Mapping
- `Modal` → `Dialog`
- `Button` → `Button` (similar API)
- `TextInput` → `Input`
- `Form`/`FormGroup` → `Form`/`FormField`
- `Alert` → `Alert`
- `Card` → `Card`
- `Table` → `Table`

## Important Context

### Cockpit Integration
This is a **Cockpit plugin** that uses:
- `cockpit.spawn()` for command execution
- Superuser privileges for system operations
- Samba-tool command integration

### Samba Commands
Common patterns:
```bash
samba-tool user list
samba-tool user create <username> <password>
samba-tool computer list
samba-tool domain info
```

### ESLint Configuration
- Uses `@typescript-eslint` + React rules
- Configured for JSX indentation (4 spaces)
- Allows console logging
- Disables some strict rules for migration period

## Module Complexity Notes

- **Domain module**: Most complex with backup/trust subdirectories
- **User/Group modules**: Good templates for migration patterns  
- **DNS/GPO modules**: Medium complexity with specialized UIs
- **Simple modules**: CRUD operations with standard patterns

## Development Tips

1. **Check migration status**: Look for `.tsx` vs `.js` files in modules
2. **Follow existing patterns**: Examine `user/` module for modern examples
3. **Use type definitions**: Check `src/types/` for existing interfaces
4. **Test coverage**: Maintain high test coverage during migration
5. **Cockpit API**: Mock properly in tests, handle command failures gracefully
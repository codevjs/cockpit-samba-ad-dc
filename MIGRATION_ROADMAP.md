# Samba AD DC Modernization Roadmap

## Overview

This document outlines the complete migration strategy for transforming the Samba Active Directory Domain Controller management interface from legacy JavaScript/PatternFly to a modern TypeScript + Tailwind CSS + Shadcn/ui stack.

## Current State Analysis

### Codebase Assessment
- **16 core modules** requiring migration
- **~80-100 JavaScript files** to convert to TypeScript
- **Mixed migration states**: Some partially modernized, others fully legacy
- **Complex nested structures**: `domain/` module has subdirectories (`backup/`, `trust/`)
- **Infrastructure**: Modern build system already established ✅

### Module Complexity Analysis

| Module | Files Count | Complexity | Priority | Notes |
|--------|-------------|------------|----------|-------|
| user/ | 8 files | Medium | HIGH | Already 50% modernized |
| computer/ | 6 files | Low | HIGH | Clean structure |
| group/ | 6 files | Low | HIGH | Similar to user module |
| domain/ | 15+ files | HIGH | CRITICAL | Has subdirectories |
| dns/ | 9 files | Medium | MEDIUM | Zone management complexity |
| gpo/ | 12 files | High | MEDIUM | File operations |
| organization_unit/ | 7 files | Medium | LOW | Tree structures |
| Others | 4-6 each | Low-Medium | LOW | Standard CRUD operations |

## Migration Phases

## Phase 1: Foundation (Weeks 1-2)

### 1.1 Shared Infrastructure Setup ✅ COMPLETED
- [x] TypeScript configuration
- [x] Webpack 5 setup
- [x] Tailwind CSS integration  
- [x] Shadcn/ui base components
- [x] ESLint + Jest configuration

### 1.2 Core Component Library
**Status**: 🔄 IN PROGRESS

#### Essential Shadcn Components to Add
```bash
# Install additional components
npx shadcn-ui@latest add table
npx shadcn-ui@latest add form
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add navigation-menu
```

#### Shared Components to Implement
- [ ] `DataTable` - Reusable table with sorting/filtering
- [ ] `ConfirmDialog` - Delete confirmation dialogs
- [ ] `LoadingSpinner` - Loading states
- [ ] `ErrorAlert` - Error display component
- [ ] `SuccessToast` - Success notifications
- [ ] `BackButton` - Navigation component
- [ ] `Toolbar` - Action button groups

### 1.3 TypeScript Foundations
**Status**: 🔄 IN PROGRESS

#### Core Type Definitions
```typescript
// src/types/samba.ts
interface SambaUser {
  username: string;
  displayName?: string;
  email?: string;
  enabled: boolean;
  lastLogin?: Date;
  groups: string[];
}

interface SambaComputer {
  name: string;
  distinguishedName: string;
  enabled: boolean;
  operatingSystem?: string;
  lastLogon?: Date;
}

interface SambaGroup {
  name: string;
  description?: string;
  members: string[];
  groupType: 'Security' | 'Distribution';
}
```

#### API Service Layer
```typescript
// src/services/samba-api.ts  
class SambaAPI {
  async executeCommand(command: string[]): Promise<string> {
    return cockpit.spawn(command, { superuser: true, err: "message" });
  }

  async createUser(userData: CreateUserInput): Promise<SambaUser> {
    // Implementation with proper error handling
  }
}
```

## Phase 2: Core Module Migration (Weeks 3-6)

### 2.1 User Module Migration (Week 3)
**Priority**: HIGH - Foundation for all other modules

#### Current State
- [x] `list.tsx` - Already modernized
- [x] `list.test.tsx` - Test coverage exists
- [ ] `create.js` → `create.tsx` + TypeScript interfaces
- [ ] `delete.js` → `delete.tsx` + confirmation dialog
- [ ] `show.js` → `show.tsx` + detailed view
- [ ] `password.js` → `password.tsx` + form validation
- [ ] `enable.js`, `disable.js` → combined toggle component
- [ ] `move.js` → `move.tsx` + OU selection
- [ ] `setexpiry.js`, `setpassword.js` → form components

#### Migration Tasks
```typescript
// User module structure
src/user/
├── components/
│   ├── CreateUserDialog.tsx      // from create.js
│   ├── UserDetailsView.tsx       // from show.js  
│   ├── DeleteUserDialog.tsx      // from delete.js
│   ├── PasswordChangeForm.tsx    // from password.js, setpassword.js
│   ├── UserStatusToggle.tsx      // from enable.js, disable.js
│   ├── MoveUserDialog.tsx        // from move.js
│   └── UserExpiryForm.tsx        // from setexpiry.js
├── hooks/
│   ├── useUsers.ts               // Data fetching logic
│   ├── useUserMutations.ts       // CRUD operations
│   └── useUserValidation.ts      // Form validation
├── types/
│   └── user.ts                   // User-related types
├── services/
│   └── user-api.ts               // API calls
└── index.tsx                     // Main user management page
```

### 2.2 Computer Module Migration (Week 4)
**Priority**: HIGH - Clean structure, good template

#### Migration Strategy
- Replace PatternFly Toolbar with Shadcn UI components
- Implement responsive action grid
- Add computer status indicators
- Create computer details modal

### 2.3 Group Module Migration (Week 5)
**Priority**: HIGH - Similar to user module

#### Focus Areas  
- Group member management interface
- Nested group handling
- Group type selection (Security vs Distribution)

### 2.4 Domain Module Migration (Week 6)  
**Priority**: CRITICAL - Most complex module

#### Complex Structure
```
domain/
├── backup/                    # Backup operations
│   ├── offline.js
│   ├── online.js  
│   ├── rename.js
│   └── restore.js
├── trust/                     # Trust relationships
│   ├── create.js
│   ├── delete.js
│   ├── list.js
│   ├── namespaces.js
│   ├── show.js
│   └── validate.js
├── classicupgrade.js
├── dcpromo.js
├── demote.js
├── info.js
└── join.js
```

#### Migration Approach
- Organize into logical component hierarchy
- Create specialized wizards for complex operations
- Implement trust relationship visualizations

## Phase 3: Extended Module Migration (Weeks 7-10)

### 3.1 DNS Module (Week 7)
- Zone management with modern table components
- Real-time DNS record validation
- DNS record type-specific forms

### 3.2 GPO Module (Week 8)
- Policy management interface
- File upload/download components  
- Policy inheritance visualization

### 3.3 Organization Unit Module (Week 9)
- Tree view component for OU hierarchy
- Drag-and-drop object management
- OU permissions interface

### 3.4 Remaining Modules (Week 10)
- Contact Management
- Delegation Management  
- DSACL Management
- Forest Management
- FSMO Management
- NTACL Management
- Sites Management
- SPN Management
- Time Management

## Phase 4: Architecture Modernization (Weeks 11-12)

### 4.1 Single Page Application Conversion
**Objective**: Replace .html files with React Router

#### Implementation Plan
```typescript
// App routing structure
<Router>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/users" element={<UserManagement />} />
    <Route path="/computers" element={<ComputerManagement />} />
    <Route path="/groups" element={<GroupManagement />} />
    <Route path="/domain" element={<DomainManagement />} />
    {/* ... other routes */}
  </Routes>
</Router>
```

#### Navigation Components
- Main navigation sidebar
- Breadcrumb navigation
- Module-specific sub-navigation
- 404/error page handling

### 4.2 State Management Implementation
**Technology**: React Context + useReducer (or Zustand for complex state)

#### Global State Requirements
- User authentication/permissions
- AD DC connection status  
- Real-time notifications
- Form state persistence
- Loading states across modules

## Phase 5: Performance & Quality Assurance (Weeks 13-14)

### 5.1 Performance Optimization
- **Code Splitting**: Split bundles by module
- **Lazy Loading**: Load components on demand
- **Virtual Scrolling**: Handle large data lists
- **Bundle Analysis**: Optimize package sizes
- **Caching Strategy**: Implement proper data caching

### 5.2 Testing Implementation
**Target**: 100% test coverage

#### Testing Strategy
```typescript
// Test structure for each module
__tests__/
├── components/
│   ├── CreateDialog.test.tsx
│   ├── ListTable.test.tsx
│   └── DeleteDialog.test.tsx
├── hooks/
│   └── useModuleData.test.ts
├── services/
│   └── api.test.ts
└── integration/
    └── module-workflow.test.tsx
```

#### Test Types
- **Unit Tests**: Individual component testing
- **Integration Tests**: API interaction testing  
- **E2E Tests**: Critical user workflows
- **Visual Regression Tests**: UI consistency

### 5.3 Security Audit
- Input sanitization review
- XSS prevention validation
- CSRF protection implementation
- Authentication/authorization review
- Security dependency audit

## Migration Pattern Template

### Standard Module Migration Process

#### 1. Pre-Migration Analysis
```bash
# Analyze existing module
grep -r "cockpit\." src/module/  # Find API calls
grep -r "PatternFly" src/module/ # Find UI dependencies  
grep -r "import.*scss" src/module/ # Find style dependencies
```

#### 2. File Structure Setup
```typescript
src/module/
├── components/           # React components
│   ├── CreateDialog.tsx
│   ├── ListView.tsx
│   ├── DetailsView.tsx
│   └── DeleteDialog.tsx
├── hooks/               # Custom hooks
│   ├── useModuleData.ts
│   └── useModuleMutations.ts
├── types/               # TypeScript types
│   └── index.ts
├── services/            # API layer
│   └── api.ts
├── __tests__/           # Tests
│   └── components/
└── index.tsx            # Module entry point
```

#### 3. TypeScript Interface Definition
```typescript
// Define clear interfaces for each entity
interface ModuleEntity {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  // ... specific properties
}

// Form input types
interface CreateModuleInput {
  name: string;
  // ... required fields for creation
}

interface UpdateModuleInput extends Partial<CreateModuleInput> {
  id: string;
}
```

#### 4. API Service Implementation
```typescript
export class ModuleAPI {
  async list(): Promise<ModuleEntity[]> {
    const result = await cockpit.spawn(['samba-tool', 'module', 'list'], {
      superuser: true,
      err: 'message'
    });
    return this.parseListOutput(result);
  }

  async create(data: CreateModuleInput): Promise<ModuleEntity> {
    // Implementation with proper error handling
  }

  async delete(id: string): Promise<void> {
    // Implementation with confirmation
  }
}
```

#### 5. Component Implementation
```typescript
export const ModuleManagement: React.FC = () => {
  const { data, loading, error } = useModuleData();
  const { create, delete: deleteItem } = useModuleMutations();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Module Management</h1>
        <CreateDialog onCreate={create} />
      </div>
      
      <DataTable
        data={data}
        loading={loading}
        error={error}
        onDelete={deleteItem}
      />
    </div>
  );
};
```

## Success Metrics & Validation

### Completion Criteria
- [ ] **0 JavaScript files** remaining (100% TypeScript conversion)
- [ ] **0 PatternFly imports** (100% Shadcn/ui adoption)  
- [ ] **0 SCSS imports** (100% Tailwind CSS)
- [ ] **100% test coverage** across all modules
- [ ] **< 2 second page load times**
- [ ] **Responsive design** on all screen sizes (mobile-first)
- [ ] **WCAG 2.1 AA compliance** for accessibility
- [ ] **Zero console errors/warnings** in production

### Performance Targets
- Initial page load: < 2s
- Route transitions: < 200ms  
- API response handling: < 100ms
- Bundle size: < 1MB gzipped

### Quality Gates
- ESLint: 0 errors, 0 warnings
- TypeScript: Strict mode, 0 errors
- Tests: 100% coverage, all passing
- Lighthouse score: 95+ (Performance, Accessibility, Best Practices, SEO)

## Risk Mitigation

### High-Risk Areas
1. **Domain Module Complexity**: Break into smaller, manageable components
2. **API Changes**: Maintain backward compatibility during transition
3. **User Experience**: Ensure no functionality is lost during migration
4. **Performance**: Monitor bundle sizes and loading times

### Rollback Strategy
- Feature flags for gradual rollout
- Parallel deployment capability  
- Database/state migration reversibility
- Component-level rollback capability

## Timeline Summary

| Phase | Duration | Focus | Deliverables |
|-------|----------|-------|--------------|
| 1 | Weeks 1-2 | Foundation | Shared components, utilities |
| 2 | Weeks 3-6 | Core Modules | User, Computer, Group, Domain |
| 3 | Weeks 7-10 | Extended Modules | DNS, GPO, OU, Others |
| 4 | Weeks 11-12 | Architecture | SPA, State Management |
| 5 | Weeks 13-14 | Quality | Testing, Performance, Security |

**Total Duration**: 14 weeks (~3.5 months)
**Resource Requirement**: 1-2 senior frontend developers
**Risk Level**: Medium (well-defined scope and incremental approach)

---

*This roadmap provides a comprehensive, phase-by-phase approach to completely modernizing the Samba AD DC management interface while maintaining functionality and ensuring high quality standards throughout the process.*
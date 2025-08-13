// Validation Schemas using Zod

import { z } from 'zod';

// Common validation patterns
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{1,64}$/;
const COMPUTER_NAME_PATTERN = /^[a-zA-Z0-9-]{1,15}$/;
const GROUP_NAME_PATTERN = /^[a-zA-Z0-9 ._-]{1,64}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password complexity requirements for Active Directory
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Custom validation messages
const VALIDATION_MESSAGES = {
  username: {
    required: 'Username is required',
    invalid: 'Username can only contain letters, numbers, dots, underscores, and hyphens (1-64 characters)',
    tooShort: 'Username must be at least 1 character',
    tooLong: 'Username cannot exceed 64 characters',
  },
  password: {
    required: 'Password is required',
    tooShort: 'Password must be at least 8 characters',
    tooWeak: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  },
  email: {
    invalid: 'Please enter a valid email address',
  },
  computerName: {
    required: 'Computer name is required',
    invalid: 'Computer name can only contain letters, numbers, and hyphens (1-15 characters)',
    invalidStart: 'Computer name cannot start or end with a hyphen',
  },
  groupName: {
    required: 'Group name is required',
    invalid: 'Group name can only contain letters, numbers, spaces, dots, underscores, and hyphens (1-64 characters)',
  },
};

// Base schemas
export const usernameSchema = z
  .string()
  .min(1, VALIDATION_MESSAGES.username.required)
  .max(64, VALIDATION_MESSAGES.username.tooLong)
  .regex(USERNAME_PATTERN, VALIDATION_MESSAGES.username.invalid);

export const passwordSchema = z
  .string()
  .min(8, VALIDATION_MESSAGES.password.tooShort)
  .regex(PASSWORD_PATTERN, VALIDATION_MESSAGES.password.tooWeak);

export const optionalPasswordSchema = passwordSchema.optional().or(z.literal(''));

export const emailSchema = z
  .string()
  .email(VALIDATION_MESSAGES.email.invalid)
  .optional()
  .or(z.literal(''));

export const computerNameSchema = z
  .string()
  .min(1, VALIDATION_MESSAGES.computerName.required)
  .max(15, 'Computer name cannot exceed 15 characters')
  .regex(COMPUTER_NAME_PATTERN, VALIDATION_MESSAGES.computerName.invalid)
  .refine(
    (name) => !name.startsWith('-') && !name.endsWith('-'),
    VALIDATION_MESSAGES.computerName.invalidStart
  );

export const groupNameSchema = z
  .string()
  .min(1, VALIDATION_MESSAGES.groupName.required)
  .max(64, 'Group name cannot exceed 64 characters')
  .regex(GROUP_NAME_PATTERN, VALIDATION_MESSAGES.groupName.invalid);

// User validation schemas
export const createUserSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  firstName: z.string().max(64).optional().or(z.literal('')),
  lastName: z.string().max(64).optional().or(z.literal('')),
  displayName: z.string().max(256).optional().or(z.literal('')),
  email: emailSchema,
  description: z.string().max(1024).optional().or(z.literal('')),
  organizationalUnit: z.string().optional().or(z.literal('')),
  groups: z.array(z.string()).optional().default([]),
  mustChangePassword: z.boolean().default(false),
  passwordNeverExpires: z.boolean().default(false),
  accountExpires: z.date().optional(),
});

export const updateUserSchema = z.object({
  username: usernameSchema,
  firstName: z.string().max(64).optional().or(z.literal('')),
  lastName: z.string().max(64).optional().or(z.literal('')),
  displayName: z.string().max(256).optional().or(z.literal('')),
  email: emailSchema,
  description: z.string().max(1024).optional().or(z.literal('')),
  organizationalUnit: z.string().optional().or(z.literal('')),
  groups: z.array(z.string()).optional(),
  enabled: z.boolean().optional(),
  mustChangePassword: z.boolean().optional(),
  passwordNeverExpires: z.boolean().optional(),
  accountExpires: z.date().optional(),
});

export const changePasswordSchema = z.object({
  username: usernameSchema,
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Computer validation schemas
export const createComputerSchema = z.object({
  name: computerNameSchema,
  organizationalUnit: z.string().optional().or(z.literal('')),
  description: z.string().max(1024).optional().or(z.literal('')),
});

export const updateComputerSchema = z.object({
  name: computerNameSchema,
  organizationalUnit: z.string().optional().or(z.literal('')),
  description: z.string().max(1024).optional().or(z.literal('')),
  enabled: z.boolean().optional(),
});

// Group validation schemas
export const createGroupSchema = z.object({
  name: groupNameSchema,
  displayName: z.string().max(256).optional().or(z.literal('')),
  description: z.string().max(1024).optional().or(z.literal('')),
  groupType: z.enum(['Security', 'Distribution'], {
    required_error: 'Please select a group type',
  }),
  groupScope: z.enum(['DomainLocal', 'Global', 'Universal'], {
    required_error: 'Please select a group scope',
  }),
  organizationalUnit: z.string().optional().or(z.literal('')),
});

export const updateGroupSchema = z.object({
  name: groupNameSchema,
  displayName: z.string().max(256).optional().or(z.literal('')),
  description: z.string().max(1024).optional().or(z.literal('')),
  organizationalUnit: z.string().optional().or(z.literal('')),
});

// Organizational Unit validation schemas
export const createOUSchema = z.object({
  name: z
    .string()
    .min(1, 'OU name is required')
    .max(64, 'OU name cannot exceed 64 characters')
    .regex(/^[a-zA-Z0-9 ._-]+$/, 'OU name contains invalid characters'),
  description: z.string().max(1024).optional().or(z.literal('')),
  parentOU: z.string().optional().or(z.literal('')),
});

// DNS validation schemas
export const createDNSRecordSchema = z.object({
  zoneName: z.string().min(1, 'Zone name is required'),
  name: z
    .string()
    .min(1, 'Record name is required')
    .max(255, 'Record name cannot exceed 255 characters'),
  type: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT'], {
    required_error: 'Please select a record type',
  }),
  data: z.string().min(1, 'Record data is required'),
  ttl: z.number().min(1).max(2147483647).optional(),
});

// GPO validation schemas
export const createGPOSchema = z.object({
  name: z
    .string()
    .min(1, 'GPO name is required')
    .max(64, 'GPO name cannot exceed 64 characters')
    .regex(/^[a-zA-Z0-9 ._-]+$/, 'GPO name contains invalid characters'),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(256, 'Display name cannot exceed 256 characters'),
  description: z.string().max(1024).optional().or(z.literal('')),
});

// Filter and search validation schemas
export const filterOptionsSchema = z.object({
  search: z.string().optional(),
  enabled: z.boolean().optional(),
  organizationalUnit: z.string().optional(),
  groups: z.array(z.string()).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export const sortOptionsSchema = z.object({
  field: z.string().min(1),
  direction: z.enum(['asc', 'desc']),
});

export const paginationOptionsSchema = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(1).max(1000),
});

// Bulk operations validation
export const bulkDeleteSchema = z.object({
  items: z.array(z.string()).min(1, 'Please select at least one item to delete'),
  confirmText: z.literal('DELETE', {
    errorMap: () => ({ message: 'Please type DELETE to confirm' }),
  }),
});

export const bulkMoveSchema = z.object({
  items: z.array(z.string()).min(1, 'Please select at least one item to move'),
  targetOU: z.string().min(1, 'Please select a target organizational unit'),
});

// Import/Export validation
export const importUsersSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' }),
  format: z.enum(['csv', 'json'], { required_error: 'Please select a format' }),
  skipExisting: z.boolean().default(true),
  sendWelcomeEmail: z.boolean().default(false),
});

export const exportUsersSchema = z.object({
  format: z.enum(['csv', 'json', 'xlsx'], { required_error: 'Please select a format' }),
  includeGroups: z.boolean().default(true),
  includePasswords: z.boolean().default(false),
  filters: filterOptionsSchema.optional(),
});

// Validation helper functions
export class ValidationHelper {
  /**
   * Validate data against a schema and return formatted errors
   */
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: Record<string, string[]>;
  } {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    }

    const errors: Record<string, string[]> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(issue.message);
    });

    return { success: false, errors };
  }

  /**
   * Check password strength
   */
  static checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[@$!%*?&]/.test(password)) score += 1;
    else feedback.push('Include special characters (@$!%*?&)');

    if (password.length >= 12) score += 1;
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{12,}$/.test(password)) score += 1;

    return {
      score,
      feedback,
      isStrong: score >= 5,
    };
  }

  /**
   * Sanitize input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(
    file: File,
    allowedTypes: string[],
    maxSize: number = 5 * 1024 * 1024 // 5MB
  ): { valid: boolean; error?: string } {
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`
      };
    }

    return { valid: true };
  }
}

// Export type inference helpers
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateComputerInput = z.infer<typeof createComputerSchema>;
export type UpdateComputerInput = z.infer<typeof updateComputerSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type CreateOUInput = z.infer<typeof createOUSchema>;
export type CreateDNSRecordInput = z.infer<typeof createDNSRecordSchema>;
export type CreateGPOInput = z.infer<typeof createGPOSchema>;
export type FilterOptions = z.infer<typeof filterOptionsSchema>;
export type SortOptions = z.infer<typeof sortOptionsSchema>;
export type PaginationOptions = z.infer<typeof paginationOptionsSchema>;
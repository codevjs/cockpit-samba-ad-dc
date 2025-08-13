import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Key, Loader2, Eye, EyeOff, Shield } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

import { useUserMutations } from './hooks/useUserMutations'
import { ErrorToast, SuccessToast } from '@/common'
import { ValidationHelper } from '@/lib/validation'
import type { SambaUser } from '@/types/samba'

// Password change schema
const changePasswordSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  mustChangeAtNextLogin: z.boolean().default(false)
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordDialogProps {
    user?: SambaUser;
    username?: string;
    mode?: 'self' | 'admin';
    onPasswordChanged?: (username: string) => void;
    trigger?: React.ReactNode;
}

export default function ChangePasswordDialog ({
  user,
  username: propUsername,
  mode = 'admin',
  onPasswordChanged,
  trigger
}: ChangePasswordDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [showToasts, setShowToasts] = useState({ success: false, error: false })
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string[]; isStrong: boolean }>({ score: 0, feedback: [], isStrong: false })

  const username = user?.username || propUsername || ''
  const displayName = user?.displayName || user?.username || username

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      username,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      mustChangeAtNextLogin: false
    }
  })

  const { setPassword, changingPassword, error, clearError } = useUserMutations({
    onSuccess: (action) => {
      if (action === 'setPassword') {
        setShowToasts({ success: true, error: false })
        setIsOpen(false)
        form.reset()
        onPasswordChanged?.(username)
      }
    },
    onError: () => {
      setShowToasts({ success: false, error: true })
    }
  })

  const watchedNewPassword = form.watch('newPassword')

  // Update password strength when new password changes
  React.useEffect(() => {
    if (watchedNewPassword) {
      const strength = ValidationHelper.checkPasswordStrength(watchedNewPassword)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength({ score: 0, feedback: [], isStrong: false })
    }
  }, [watchedNewPassword])

  const onSubmit = async (data: ChangePasswordFormData) => {
    clearError()

    // For admin mode, we can set password directly
    // For self mode, we would need to validate current password first
    const success = await setPassword(data.username, data.newPassword)
    if (success && !data.mustChangeAtNextLogin) {
      // If admin doesn't want user to change at next login, we might need additional API call
      // This depends on samba-tool capabilities
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      form.reset()
      clearError()
      setShowPasswords({ current: false, new: false, confirm: false })
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500'
    if (score <= 4) return 'bg-yellow-500'
    if (score <= 5) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthLabel = (score: number) => {
    if (score <= 2) return 'Weak'
    if (score <= 4) return 'Fair'
    if (score <= 5) return 'Good'
    return 'Strong'
  }

  return (
        <>
            {showToasts.error && error && (
                <ErrorToast
                    errorMessage={error}
                    closeModal={() => setShowToasts({ ...showToasts, error: false })}
                />
            )}
            {showToasts.success && (
                <SuccessToast
                    successMessage={`Password changed successfully for "${username}".`}
                    closeModal={() => setShowToasts({ ...showToasts, success: false })}
                />
            )}

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    {trigger || (
                        <Button variant="outline" size="sm">
                            <Key className="mr-2 h-4 w-4" />
                            Change Password
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <DialogTitle>Change Password</DialogTitle>
                        </div>
                        <DialogDescription>
                            {mode === 'self'
                              ? 'Change your account password. Your new password must be strong and secure.'
                              : `Change the password for user "${displayName}". The new password must meet security requirements.`
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {mode === 'admin' && (
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter username"
                                                    disabled={!!user}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {mode === 'self' && (
                                <FormField
                                    control={form.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type={showPasswords.current ? 'text' : 'password'}
                                                        placeholder="Enter current password"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => togglePasswordVisibility('current')}
                                                    >
                                                        {showPasswords.current
                                                          ? (
                                                            <EyeOff className="h-4 w-4" />
                                                            )
                                                          : (
                                                            <Eye className="h-4 w-4" />
                                                            )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type={showPasswords.new ? 'text' : 'password'}
                                                    placeholder="Enter new password"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                >
                                                    {showPasswords.new
                                                      ? (
                                                        <EyeOff className="h-4 w-4" />
                                                        )
                                                      : (
                                                        <Eye className="h-4 w-4" />
                                                        )}
                                                </Button>
                                            </div>
                                        </FormControl>

                                        {/* Password Strength Indicator */}
                                        {watchedNewPassword && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${getPasswordStrengthColor(passwordStrength.score)}`}
                                                            style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium">
                                                        {getPasswordStrengthLabel(passwordStrength.score)}
                                                    </span>
                                                </div>
                                                {passwordStrength.feedback.length > 0 && (
                                                    <div className="text-xs text-muted-foreground">
                                                        <span className="font-medium">Suggestions: </span>
                                                        {passwordStrength.feedback.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type={showPasswords.confirm ? 'text' : 'password'}
                                                    placeholder="Confirm new password"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                >
                                                    {showPasswords.confirm
                                                      ? (
                                                        <EyeOff className="h-4 w-4" />
                                                        )
                                                      : (
                                                        <Eye className="h-4 w-4" />
                                                        )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {mode === 'admin' && (
                                <FormField
                                    control={form.control}
                                    name="mustChangeAtNextLogin"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Require password change at next login</FormLabel>
                                                <FormDescription>
                                                    Force the user to change their password when they next log in
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            )}

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={changingPassword || !passwordStrength.isStrong}
                                >
                                    {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Change Password
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
  )
}

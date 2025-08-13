import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'

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
import { Textarea } from '@/components/ui/textarea'
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

import { createUserSchema, type CreateUserInput } from '@/lib/validation'
import { useUserMutations } from './hooks/useUserMutations'
import { ErrorToast, SuccessToast } from '@/common'

interface CreateUserDialogProps {
    onUserCreated?: (user: any) => void;
    trigger?: React.ReactNode;
}

export default function CreateUserDialog ({ onUserCreated, trigger }: CreateUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showToasts, setShowToasts] = useState({ success: false, error: false })

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      displayName: '',
      email: '',
      description: '',
      organizationalUnit: '',
      groups: [],
      mustChangePassword: false,
      passwordNeverExpires: false,
      accountExpires: undefined
    }
  })

  const { create, creating, error, clearError } = useUserMutations({
    onSuccess: (action, user) => {
      if (action === 'create') {
        setShowToasts({ success: true, error: false })
        setIsOpen(false)
        form.reset()
        onUserCreated?.(user)
      }
    },
    onError: (action) => {
      setShowToasts({ success: false, error: true })
    }
  })

  const onSubmit = async (data: CreateUserInput) => {
    clearError()
    await create(data)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      form.reset()
      clearError()
    }
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
                    successMessage="User created successfully!"
                    closeModal={() => setShowToasts({ ...showToasts, success: false })}
                />
            )}

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    {trigger || (
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create User
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create User</DialogTitle>
                        <DialogDescription>
                            Create a new Active Directory user account. Fill in the required information below.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter username" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Unique username for the user account
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
                                            <FormLabel>Password *</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Enter password" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Must be at least 8 characters with mixed case, numbers, and symbols
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter first name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter last name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter display name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Full name as it will appear in the directory
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="Enter email address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter user description"
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="organizationalUnit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Organizational Unit</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter OU (e.g., ou=Users,dc=example,dc=com)" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Leave empty to use the default Users container
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-3">
                                <FormField
                                    control={form.control}
                                    name="mustChangePassword"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Must change password at next login</FormLabel>
                                                <FormDescription>
                                                    Force user to change password on first login
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="passwordNeverExpires"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Password never expires</FormLabel>
                                                <FormDescription>
                                                    Disable password expiration for this account
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={creating}>
                                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create User
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
  )
}

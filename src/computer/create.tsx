import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Loader2, Monitor } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

import { useComputerMutations } from './hooks/useComputerMutations'
import { ErrorToast, SuccessToast } from '@/common'
import type { CreateComputerInput, SambaOrganizationalUnit } from '@/types/samba'

// Computer creation schema
const createComputerSchema = z.object({
  name: z.string()
    .min(1, 'Computer name is required')
    .max(15, 'Computer name cannot exceed 15 characters')
    .regex(
      /^[A-Za-z0-9\-]+$/,
      'Computer name can only contain letters, numbers, and hyphens'
    ),
  description: z.string().optional(),
  organizationalUnit: z.string().optional()
})

type CreateComputerFormData = z.infer<typeof createComputerSchema>;

interface CreateComputerDialogProps {
    onComputerCreated?: (computer: any) => void;
    trigger?: React.ReactNode;
}

// Common organizational units for computers
const COMPUTER_ORG_UNITS: SambaOrganizationalUnit[] = [
  { name: 'Computers', distinguishedName: 'CN=Computers,DC=domain,DC=local', description: 'Default Computers container', createdAt: new Date(), children: [] },
  { name: 'Domain Controllers', distinguishedName: 'OU=Domain Controllers,DC=domain,DC=local', description: 'Domain Controllers OU', createdAt: new Date(), children: [] },
  { name: 'Workstations', distinguishedName: 'OU=Workstations,DC=domain,DC=local', description: 'Client Workstations OU', createdAt: new Date(), children: [] },
  { name: 'Servers', distinguishedName: 'OU=Servers,DC=domain,DC=local', description: 'Server Computers OU', createdAt: new Date(), children: [] },
  { name: 'Laptops', distinguishedName: 'OU=Laptops,DC=domain,DC=local', description: 'Laptop Computers OU', createdAt: new Date(), children: [] }
]

export default function CreateComputerDialog ({
  onComputerCreated,
  trigger
}: CreateComputerDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showToasts, setShowToasts] = useState({ success: false, error: false })

  const form = useForm<CreateComputerFormData>({
    resolver: zodResolver(createComputerSchema),
    defaultValues: {
      name: '',
      description: '',
      organizationalUnit: ''
    }
  })

  const { create, creating, error, clearError } = useComputerMutations({
    onSuccess: (action, newComputer) => {
      if (action === 'create') {
        setShowToasts({ success: true, error: false })
        setIsOpen(false)
        form.reset()
        onComputerCreated?.(newComputer)
      }
    },
    onError: () => {
      setShowToasts({ success: false, error: true })
    }
  })

  const onSubmit = async (data: CreateComputerFormData) => {
    clearError()

    const computerData: CreateComputerInput = {
      name: data.name,
      description: data.description || undefined,
      organizationalUnit: data.organizationalUnit || undefined
    }

    await create(computerData)
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
                    successMessage="Computer account created successfully!"
                    closeModal={() => setShowToasts({ ...showToasts, success: false })}
                />
            )}

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    {trigger || (
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Computer
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <Monitor className="h-5 w-5 text-primary" />
                            <DialogTitle>Create New Computer Account</DialogTitle>
                        </div>
                        <DialogDescription>
                            Create a new computer account in Active Directory. The computer name should match the actual computer's name.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Computer Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="COMPUTER01"
                                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the computer name (up to 15 characters, letters, numbers, and hyphens only)
                                        </FormDescription>
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
                                                {...field}
                                                placeholder="Optional description for this computer..."
                                                rows={3}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide an optional description for the computer account
                                        </FormDescription>
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
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Organizational Unit (optional)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {COMPUTER_ORG_UNITS.map((ou) => (
                                                    <SelectItem key={ou.distinguishedName} value={ou.distinguishedName}>
                                                        <div className="flex flex-col">
                                                            <span>{ou.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {ou.description}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Choose where to create the computer account (defaults to Computers container)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                    Create Computer
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
  )
}

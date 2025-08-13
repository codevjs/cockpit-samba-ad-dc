import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Move, Loader2, FolderTree } from 'lucide-react'
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

import { useUserMutations } from './hooks/useUserMutations'
import { ErrorToast, SuccessToast } from '@/common'
import type { SambaUser, SambaOrganizationalUnit } from '@/types/samba'

// Move user schema
const moveUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  targetOU: z.string().min(1, 'Target Organizational Unit is required'),
  customOU: z.string().optional()
}).refine((data) => {
  if (data.targetOU === 'custom' && !data.customOU?.trim()) {
    return false
  }
  return true
}, {
  message: 'Please specify the custom Organizational Unit path',
  path: ['customOU']
})

type MoveUserFormData = z.infer<typeof moveUserSchema>;

interface MoveUserDialogProps {
    user?: SambaUser;
    username?: string;
    onUserMoved?: (username: string, newOU: string) => void;
    trigger?: React.ReactNode;
}

// Common organizational units in AD
const COMMON_ORG_UNITS: SambaOrganizationalUnit[] = [
  { name: 'Users', distinguishedName: 'CN=Users,DC=domain,DC=local', description: 'Default Users container', createdAt: new Date(), children: [] },
  { name: 'Computers', distinguishedName: 'CN=Computers,DC=domain,DC=local', description: 'Default Computers container', createdAt: new Date(), children: [] },
  { name: 'Domain Controllers', distinguishedName: 'OU=Domain Controllers,DC=domain,DC=local', description: 'Domain Controllers OU', createdAt: new Date(), children: [] },
  { name: 'IT Department', distinguishedName: 'OU=IT,DC=domain,DC=local', description: 'IT Department OU', createdAt: new Date(), children: [] },
  { name: 'Sales Department', distinguishedName: 'OU=Sales,DC=domain,DC=local', description: 'Sales Department OU', createdAt: new Date(), children: [] },
  { name: 'HR Department', distinguishedName: 'OU=HR,DC=domain,DC=local', description: 'Human Resources OU', createdAt: new Date(), children: [] },
  { name: 'Finance Department', distinguishedName: 'OU=Finance,DC=domain,DC=local', description: 'Finance Department OU', createdAt: new Date(), children: [] }
]

export default function MoveUserDialog ({
  user,
  username: propUsername,
  onUserMoved,
  trigger
}: MoveUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showToasts, setShowToasts] = useState({ success: false, error: false })
  const [availableOUs, setAvailableOUs] = useState<SambaOrganizationalUnit[]>(COMMON_ORG_UNITS)

  const username = user?.username || propUsername || ''
  const displayName = user?.displayName || user?.username || username
  const currentOU = user?.organizationalUnit || 'CN=Users,DC=domain,DC=local'

  const form = useForm<MoveUserFormData>({
    resolver: zodResolver(moveUserSchema),
    defaultValues: {
      username,
      targetOU: '',
      customOU: ''
    }
  })

  const { move: moveUser, moving, error, clearError } = useUserMutations({
    onSuccess: (action, result) => {
      if (action === 'move') {
        setShowToasts({ success: true, error: false })
        setIsOpen(false)
        form.reset()
        onUserMoved?.(username, result.organizationalUnit)
      }
    },
    onError: () => {
      setShowToasts({ success: false, error: true })
    }
  })

  const watchedTargetOU = form.watch('targetOU')

  // Load available OUs from the domain (in a real implementation)
  useEffect(() => {
    // In a real implementation, you would fetch actual OUs from the domain
    // For now, we'll use the common OUs defined above
    setAvailableOUs(COMMON_ORG_UNITS)
  }, [])

  const onSubmit = async (data: MoveUserFormData) => {
    clearError()

    const targetOUPath = data.targetOU === 'custom'
      ? data.customOU || ''
      : data.targetOU

    await moveUser(data.username, targetOUPath)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      form.reset()
      clearError()
    }
  }

  const getOUDisplayName = (ouDn: string) => {
    // Extract the OU name from the distinguished name
    const match = ouDn.match(/^(CN|OU)=([^,]+)/)
    return match ? match[2] : ouDn
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
                    successMessage={`User "${username}" moved successfully to new organizational unit.`}
                    closeModal={() => setShowToasts({ ...showToasts, success: false })}
                />
            )}

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    {trigger || (
                        <Button variant="outline" size="sm">
                            <Move className="mr-2 h-4 w-4" />
                            Move User
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <FolderTree className="h-5 w-5 text-primary" />
                            <DialogTitle>Move User to Organizational Unit</DialogTitle>
                        </div>
                        <DialogDescription asChild>
                            <div className="space-y-2">
                                <p>
                                    Move user <strong>"{displayName}"</strong> to a different Organizational Unit in Active Directory.
                                </p>
                                {user && currentOU && (
                                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                        <strong>Current location:</strong> {getOUDisplayName(currentOU)}
                                        <br />
                                        <span className="text-xs">{currentOU}</span>
                                    </div>
                                )}
                            </div>
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

                            <FormField
                                control={form.control}
                                name="targetOU"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target Organizational Unit</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select target Organizational Unit" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {availableOUs.map((ou) => (
                                                    <SelectItem
                                                        key={ou.distinguishedName}
                                                        value={ou.distinguishedName}
                                                        disabled={ou.distinguishedName === currentOU}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span>{ou.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {ou.description}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="custom">
                                                    <div className="flex flex-col">
                                                        <span>Custom OU Path...</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Specify a custom Organizational Unit
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Choose the destination Organizational Unit for this user
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {watchedTargetOU === 'custom' && (
                                <FormField
                                    control={form.control}
                                    name="customOU"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Custom OU Path</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="OU=Department,DC=domain,DC=local"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Enter the full Distinguished Name (DN) of the target OU
                                            </FormDescription>
                                            <FormMessage />
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
                                <Button type="submit" disabled={moving}>
                                    {moving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Move User
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
  )
}

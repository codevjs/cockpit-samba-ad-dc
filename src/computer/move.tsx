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

import { useComputerMutations } from './hooks/useComputerMutations'
import { ErrorToast, SuccessToast } from '@/common'
import type { SambaComputer, SambaOrganizationalUnit } from '@/types/samba'

// Move computer schema
const moveComputerSchema = z.object({
  computerName: z.string().min(1, 'Computer name is required'),
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

type MoveComputerFormData = z.infer<typeof moveComputerSchema>;

interface MoveComputerDialogProps {
    computer?: SambaComputer;
    computerName?: string;
    onComputerMoved?: (computerName: string, newOU: string) => void;
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

export default function MoveComputerDialog ({
  computer,
  computerName: propComputerName,
  onComputerMoved,
  trigger
}: MoveComputerDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showToasts, setShowToasts] = useState({ success: false, error: false })
  const [availableOUs, setAvailableOUs] = useState<SambaOrganizationalUnit[]>(COMPUTER_ORG_UNITS)

  const computerName = computer?.name || propComputerName || ''
  const displayName = computer?.name || computerName
  const currentOU = computer?.organizationalUnit || 'CN=Computers,DC=domain,DC=local'

  const form = useForm<MoveComputerFormData>({
    resolver: zodResolver(moveComputerSchema),
    defaultValues: {
      computerName,
      targetOU: '',
      customOU: ''
    }
  })

  const { move: moveComputer, moving, error, clearError } = useComputerMutations({
    onSuccess: (action, result) => {
      if (action === 'move') {
        setShowToasts({ success: true, error: false })
        setIsOpen(false)
        form.reset()
        onComputerMoved?.(computerName, result.organizationalUnit)
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
    setAvailableOUs(COMPUTER_ORG_UNITS)
  }, [])

  const onSubmit = async (data: MoveComputerFormData) => {
    clearError()

    const targetOUPath = data.targetOU === 'custom'
      ? data.customOU || ''
      : data.targetOU

    await moveComputer(data.computerName, targetOUPath)
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
                    successMessage={`Computer "${computerName}" moved successfully to new organizational unit.`}
                    closeModal={() => setShowToasts({ ...showToasts, success: false })}
                />
            )}

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    {trigger || (
                        <Button variant="outline" size="sm">
                            <Move className="mr-2 h-4 w-4" />
                            Move Computer
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <FolderTree className="h-5 w-5 text-primary" />
                            <DialogTitle>Move Computer to Organizational Unit</DialogTitle>
                        </div>
                        <DialogDescription asChild>
                            <div className="space-y-2">
                                <p>
                                    Move computer <strong>"{displayName}"</strong> to a different Organizational Unit in Active Directory.
                                </p>
                                {computer && currentOU && (
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
                                name="computerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Computer Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter computer name"
                                                disabled={!!computer}
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
                                            Choose the destination Organizational Unit for this computer
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
                                    Move Computer
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
  )
}

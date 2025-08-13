import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Clock, Loader2 } from 'lucide-react'
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
import type { SambaUser } from '@/types/samba'

// Account expiry schema
const setExpirySchema = z.object({
  username: z.string().min(1, 'Username is required'),
  neverExpires: z.boolean().default(false),
  expiryDate: z.string().optional(),
  daysFromNow: z.string().optional()
}).refine((data) => {
  if (!data.neverExpires && !data.expiryDate && !data.daysFromNow) {
    return false
  }
  if (data.daysFromNow && isNaN(parseInt(data.daysFromNow))) {
    return false
  }
  return true
}, {
  message: 'Please set an expiry date, days from now, or select never expires',
  path: ['expiryDate']
})

type SetExpiryFormData = z.infer<typeof setExpirySchema>;

interface SetExpiryDialogProps {
    user?: SambaUser;
    username?: string;
    onExpiryChanged?: (username: string, expiryDate?: Date) => void;
    trigger?: React.ReactNode;
}

export default function SetExpiryDialog ({
  user,
  username: propUsername,
  onExpiryChanged,
  trigger
}: SetExpiryDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showToasts, setShowToasts] = useState({ success: false, error: false })
  const [expiryMode, setExpiryMode] = useState<'never' | 'date' | 'days'>('never')

  const username = user?.username || propUsername || ''
  const displayName = user?.displayName || user?.username || username

  const form = useForm<SetExpiryFormData>({
    resolver: zodResolver(setExpirySchema),
    defaultValues: {
      username,
      neverExpires: true,
      expiryDate: '',
      daysFromNow: ''
    }
  })

  const { setExpiry, updating, error, clearError } = useUserMutations({
    onSuccess: (action, updatedUser) => {
      if (action === 'setExpiry') {
        setShowToasts({ success: true, error: false })
        setIsOpen(false)
        form.reset()
        onExpiryChanged?.(username, updatedUser.accountExpires)
      }
    },
    onError: () => {
      setShowToasts({ success: false, error: true })
    }
  })

  const watchNeverExpires = form.watch('neverExpires')

  React.useEffect(() => {
    if (watchNeverExpires) {
      setExpiryMode('never')
      form.setValue('expiryDate', '')
      form.setValue('daysFromNow', '')
    }
  }, [watchNeverExpires, form])

  const onSubmit = async (data: SetExpiryFormData) => {
    clearError()

    let expiryDate: Date | undefined

    if (data.neverExpires) {
      // No expiry
      expiryDate = undefined
    } else if (data.expiryDate) {
      // Specific date
      expiryDate = new Date(data.expiryDate)
    } else if (data.daysFromNow) {
      // Days from now
      const days = parseInt(data.daysFromNow)
      expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + days)
    }

    await setExpiry(data.username, expiryDate)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      form.reset()
      clearError()
      setExpiryMode('never')
    }
  }

  const handleModeChange = (mode: 'never' | 'date' | 'days') => {
    setExpiryMode(mode)
    form.setValue('neverExpires', mode === 'never')
    if (mode !== 'date') form.setValue('expiryDate', '')
    if (mode !== 'days') form.setValue('daysFromNow', '')
  }

  const formatCurrentExpiry = () => {
    if (!user?.accountExpires) return 'Never expires'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(user.accountExpires)
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
                    successMessage={`Account expiry updated successfully for "${username}".`}
                    closeModal={() => setShowToasts({ ...showToasts, success: false })}
                />
            )}

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    {trigger || (
                        <Button variant="outline" size="sm">
                            <Calendar className="mr-2 h-4 w-4" />
                            Set Expiry
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <DialogTitle>Set Account Expiry</DialogTitle>
                        </div>
                        <DialogDescription asChild>
                            <div className="space-y-2">
                                <p>
                                    Configure the account expiration for user <strong>"{displayName}"</strong>.
                                </p>
                                {user && (
                                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                        <strong>Current expiry:</strong> {formatCurrentExpiry()}
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

                            <div className="space-y-4">
                                <FormLabel>Expiry Settings</FormLabel>

                                {/* Never Expires Option */}
                                <FormField
                                    control={form.control}
                                    name="neverExpires"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => {
                                                      field.onChange(checked)
                                                      handleModeChange(checked ? 'never' : 'date')
                                                    }}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Account never expires</FormLabel>
                                                <FormDescription>
                                                    The account will remain active indefinitely
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {/* Specific Date Option */}
                                {!watchNeverExpires && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant={expiryMode === 'date' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleModeChange('date')}
                                            >
                                                Specific Date
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={expiryMode === 'days' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleModeChange('days')}
                                            >
                                                Days from Now
                                            </Button>
                                        </div>

                                        {expiryMode === 'date' && (
                                            <FormField
                                                control={form.control}
                                                name="expiryDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Expiry Date</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="datetime-local"
                                                                min={new Date().toISOString().slice(0, 16)}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Select the exact date and time when the account should expire
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        {expiryMode === 'days' && (
                                            <FormField
                                                control={form.control}
                                                name="daysFromNow"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Days from Now</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                min="1"
                                                                placeholder="Enter number of days"
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Number of days from today when the account should expire
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updating}>
                                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Expiry
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
  )
}

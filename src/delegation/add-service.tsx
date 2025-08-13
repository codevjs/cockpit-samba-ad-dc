import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { useDelegationMutations } from './hooks/useDelegation'
import { toast } from 'sonner'
import type { AddServiceDelegationInput } from '@/types/samba'

const addServiceSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  principal: z.string().min(1, 'Service principal is required')
})

type AddServiceFormData = z.infer<typeof addServiceSchema>;

interface AddServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded: () => void;
}

export function AddServiceDialog ({ isOpen, onClose, onServiceAdded }: AddServiceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AddServiceFormData>({
    resolver: zodResolver(addServiceSchema),
    defaultValues: {
      accountName: '',
      principal: ''
    }
  })

  const { addService } = useDelegationMutations(
    () => {
      onServiceAdded()
      handleClose()
    },
    (error) => toast.error(error)
  )

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const onSubmit = async (data: AddServiceFormData) => {
    setIsSubmitting(true)
    try {
      const input: AddServiceDelegationInput = {
        accountName: data.accountName,
        principal: data.principal
      }

      await addService(input)
      toast.success(`Service "${data.principal}" added to delegation for "${data.accountName}"`)
    } catch (error) {
      // Error already handled by mutation hook
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Service Delegation</DialogTitle>
          <DialogDescription>
            Add a service principal to the constrained delegation list for an account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Constrained Delegation</p>
                  <p className="text-sm">
                    This adds a service principal to the msDS-AllowedToDelegateTo attribute,
                    allowing the account to delegate credentials to the specified service.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="serviceaccount1"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Name of the service account that will delegate
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="principal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Principal</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="http/webserver.domain.com"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Service principal name (SPN) to delegate to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Service Principal Examples:</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div><code>http/webserver.domain.com</code> - Web service</div>
                <div><code>cifs/fileserver.domain.com</code> - File service</div>
                <div><code>host/server.domain.com</code> - Host service</div>
                <div><code>mssqlsvc/dbserver.domain.com:1433</code> - SQL Server</div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding Service...' : 'Add Service'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

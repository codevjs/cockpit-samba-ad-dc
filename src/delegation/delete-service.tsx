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
import { useDelegationMutations } from './hooks/useDelegation'
import { toast } from 'sonner'
import type { DeleteServiceDelegationInput } from '@/types/samba'

const deleteServiceSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  principal: z.string().min(1, 'Service principal is required')
})

type DeleteServiceFormData = z.infer<typeof deleteServiceSchema>;

interface DeleteServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceDeleted: () => void;
}

export function DeleteServiceDialog ({ isOpen, onClose, onServiceDeleted }: DeleteServiceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<DeleteServiceFormData>({
    resolver: zodResolver(deleteServiceSchema),
    defaultValues: {
      accountName: '',
      principal: ''
    }
  })

  const { deleteService } = useDelegationMutations(
    () => {
      onServiceDeleted()
      handleClose()
    },
    (error) => toast.error(error)
  )

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const onSubmit = async (data: DeleteServiceFormData) => {
    setIsSubmitting(true)
    try {
      const input: DeleteServiceDelegationInput = {
        accountName: data.accountName,
        principal: data.principal
      }

      await deleteService(input)
      toast.success(`Service "${data.principal}" removed from delegation for "${data.accountName}"`)
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
          <DialogTitle>Delete Service Delegation</DialogTitle>
          <DialogDescription>
            Remove a service principal from the constrained delegation list.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    Name of the service account
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
                    Service principal name (SPN) to remove
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} variant="destructive">
                {isSubmitting ? 'Removing Service...' : 'Remove Service'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

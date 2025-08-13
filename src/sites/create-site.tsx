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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useSitesMutations } from './hooks/useSites'
import { toast } from 'sonner'
import type { CreateSiteInput } from '@/types/samba'

const createSiteSchema = z.object({
  name: z.string().min(1, 'Site name is required'),
  description: z.string().optional()
})

type CreateSiteFormData = z.infer<typeof createSiteSchema>;

interface CreateSiteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteCreated: () => void;
}

export function CreateSiteDialog ({ isOpen, onClose, onSiteCreated }: CreateSiteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateSiteFormData>({
    resolver: zodResolver(createSiteSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  })

  const { createSite } = useSitesMutations(
    () => {
      onSiteCreated()
      handleClose()
    },
    (error) => toast.error(error)
  )

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const onSubmit = async (data: CreateSiteFormData) => {
    setIsSubmitting(true)
    try {
      const siteData: CreateSiteInput = {
        name: data.name,
        description: data.description || undefined
      }

      await createSite(siteData)
      toast.success(`Site "${data.name}" created successfully`)
    } catch (error) {
      // Error already handled by mutation hook
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Site</DialogTitle>
          <DialogDescription>
            Create a new Active Directory site for managing replication topology.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter site name"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    A unique name for the site (e.g., "MainOffice", "Branch1")
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
                      placeholder="Enter site description (optional)"
                      className="resize-none"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description for the site
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Site'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

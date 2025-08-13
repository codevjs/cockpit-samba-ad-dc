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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useSitesMutations } from './hooks/useSites'
import { toast } from 'sonner'
import type { CreateSubnetInput, SambaSite } from '@/types/samba'

const createSubnetSchema = z.object({
  subnet: z.string().min(1, 'Subnet is required').regex(
    /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/,
    'Subnet must be in CIDR format (e.g., 192.168.1.0/24)'
  ),
  site: z.string().min(1, 'Site is required'),
  description: z.string().optional()
})

type CreateSubnetFormData = z.infer<typeof createSubnetSchema>;

interface CreateSubnetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubnetCreated: () => void;
  sites: SambaSite[];
}

export function CreateSubnetDialog ({ isOpen, onClose, onSubnetCreated, sites }: CreateSubnetDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateSubnetFormData>({
    resolver: zodResolver(createSubnetSchema),
    defaultValues: {
      subnet: '',
      site: '',
      description: ''
    }
  })

  const { createSubnet } = useSitesMutations(
    () => {
      onSubnetCreated()
      handleClose()
    },
    (error) => toast.error(error)
  )

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const onSubmit = async (data: CreateSubnetFormData) => {
    setIsSubmitting(true)
    try {
      const subnetData: CreateSubnetInput = {
        subnet: data.subnet,
        site: data.site,
        description: data.description || undefined
      }

      await createSubnet(subnetData)
      toast.success(`Subnet "${data.subnet}" created successfully`)
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
          <DialogTitle>Create Subnet</DialogTitle>
          <DialogDescription>
            Create a new subnet and associate it with a site for proper replication routing.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subnet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subnet</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="192.168.1.0/24"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Subnet in CIDR notation (e.g., 192.168.1.0/24)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="site"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a site" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.name} value={site.name}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The site this subnet belongs to
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
                      placeholder="Enter subnet description (optional)"
                      className="resize-none"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description for the subnet
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
                {isSubmitting ? 'Creating...' : 'Create Subnet'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

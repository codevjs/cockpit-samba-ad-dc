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
import type { SetSiteInput, SambaSite } from '@/types/samba'

const setSiteSchema = z.object({
  server: z.string().min(1, 'Server name is required'),
  site: z.string().min(1, 'Site is required')
})

type SetSiteFormData = z.infer<typeof setSiteSchema>;

interface SetSiteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteSet: () => void;
  sites: SambaSite[];
}

export function SetSiteDialog ({ isOpen, onClose, onSiteSet, sites }: SetSiteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SetSiteFormData>({
    resolver: zodResolver(setSiteSchema),
    defaultValues: {
      server: '',
      site: ''
    }
  })

  const { setSite } = useSitesMutations(
    () => {
      onSiteSet()
      handleClose()
    },
    (error) => toast.error(error)
  )

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const onSubmit = async (data: SetSiteFormData) => {
    setIsSubmitting(true)
    try {
      const setSiteData: SetSiteInput = {
        server: data.server,
        site: data.site
      }

      await setSite(setSiteData)
      toast.success(`Server "${data.server}" moved to site "${data.site}" successfully`)
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
          <DialogTitle>Set Server Site</DialogTitle>
          <DialogDescription>
            Move a domain controller server to a different site for optimal replication topology.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="server"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter server name"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Name of the domain controller server to move
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
                  <FormLabel>Target Site</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target site" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.name} value={site.name}>
                          {site.name}
                          {site.description && (
                            <span className="text-muted-foreground ml-2">
                              ({site.description})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The site where the server should be moved
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Important Note
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Moving a server to a different site will affect replication
                      topology. Ensure the target site has appropriate subnets
                      configured for optimal network routing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Moving Server...' : 'Move Server'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

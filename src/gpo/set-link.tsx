import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGPOMutations } from './hooks/useGPO'
import { toast } from 'sonner'
import type { SetGPOLinkInput } from '@/types/samba'

const setLinkSchema = z.object({
  containerDN: z.string().min(1, 'Container DN is required'),
  gpoName: z.string().min(1, 'GPO name is required'),
  linkOptions: z.string().optional(),
  order: z.number().optional()
})

type SetLinkFormData = z.infer<typeof setLinkSchema>;

interface SetLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkSet: () => void;
}

export function SetLinkDialog ({
  isOpen,
  onClose,
  onLinkSet
}: SetLinkDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SetLinkFormData>({
    resolver: zodResolver(setLinkSchema)
  })

  const { setGPOLink } = useGPOMutations(
    () => {
      toast.success('GPO link set successfully')
      onLinkSet()
    },
    (error) => {
      toast.error(`Failed to set GPO link: ${error}`)
    }
  )

  const onSubmit = async (data: SetLinkFormData) => {
    setIsSubmitting(true)
    try {
      const input: SetGPOLinkInput = {
        containerDN: data.containerDN,
        gpoName: data.gpoName,
        linkOptions: data.linkOptions,
        order: data.order
      }
      await setGPOLink(input)
      handleClose()
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set GPO Link</DialogTitle>
          <DialogDescription>
            Link a Group Policy Object to a container.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="containerDN">Container DN *</Label>
            <Input
              id="containerDN"
              {...register('containerDN')}
              placeholder="OU=Users,DC=domain,DC=com"
              className={errors.containerDN ? 'border-red-500' : ''}
            />
            {errors.containerDN && (
              <p className="text-sm text-red-500">{errors.containerDN.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gpoName">GPO Name *</Label>
            <Input
              id="gpoName"
              {...register('gpoName')}
              placeholder="GPO-Name"
              className={errors.gpoName ? 'border-red-500' : ''}
            />
            {errors.gpoName && (
              <p className="text-sm text-red-500">{errors.gpoName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkOptions">Link Options</Label>
            <Input
              id="linkOptions"
              {...register('linkOptions')}
              placeholder="Enabled"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              {...register('order', { valueAsNumber: true })}
              placeholder="1"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Setting Link...' : 'Set Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

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
import { ExternalLink, AlertTriangle } from 'lucide-react'
import { useForestMutations } from './hooks/useForest'
import { toast } from 'sonner'
import type { SetDSHeuristicsInput } from '@/types/samba'

const dsHeuristicsSchema = z.object({
  value: z.string().min(1, 'DSHeuristics value is required').regex(
    /^[0-9]+$/,
    'DSHeuristics value must contain only digits'
  )
})

type DSHeuristicsFormData = z.infer<typeof dsHeuristicsSchema>;

interface DSHeuristicsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onHeuristicsSet: () => void;
}

export function DSHeuristicsDialog ({ isOpen, onClose, onHeuristicsSet }: DSHeuristicsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<DSHeuristicsFormData>({
    resolver: zodResolver(dsHeuristicsSchema),
    defaultValues: {
      value: ''
    }
  })

  const { setDSHeuristics } = useForestMutations(
    () => {
      onHeuristicsSet()
      handleClose()
    },
    (error) => toast.error(error)
  )

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const onSubmit = async (data: DSHeuristicsFormData) => {
    setIsSubmitting(true)
    try {
      const heuristicsData: SetDSHeuristicsInput = {
        value: data.value
      }

      await setDSHeuristics(heuristicsData)
      toast.success(`DSHeuristics set to "${data.value}" successfully`)
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
          <DialogTitle>Set DSHeuristics Value</DialogTitle>
          <DialogDescription>
            Set the value of dsheuristics on the Directory Service. This value alters the behavior
            of the Directory Service on all domain controllers in the forest.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heuristics Value</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0000002"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the DSHeuristics value (numeric string, e.g., "0000002")
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Important Notice</p>
                  <p className="text-sm">
                    This setting affects the behavior of the Directory Service across the entire forest.
                    Make sure you understand the implications before proceeding.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Documentation available at:</span>
                    <a
                      href="https://msdn.microsoft.com/en-us/library/cc223560.aspx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      Microsoft Docs
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Common DSHeuristics Values:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div><code>0000000</code> - Default behavior (all heuristics disabled)</div>
                <div><code>0000001</code> - Enable anonymous LDAP access</div>
                <div><code>0000002</code> - Enable List Object access right</div>
                <div><code>0010000</code> - Allow access to userPassword attribute</div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Setting Value...' : 'Set Value'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

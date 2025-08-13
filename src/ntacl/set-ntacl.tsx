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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { useNTACLMutations } from './hooks/useNTACL'
import { toast } from 'sonner'
import type { SetNTACLInput } from '@/types/samba'

const setNTACLSchema = z.object({
  acl: z.string().min(1, 'ACL is required'),
  file: z.string().min(1, 'File path is required'),
  xattrBackend: z.string().optional(),
  eadbFile: z.string().optional(),
  useNtvfs: z.string().optional(),
  useS3fs: z.string().optional(),
  service: z.string().optional()
})

type SetNTACLFormData = z.infer<typeof setNTACLSchema>;

interface SetNTACLDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNTACLSet: () => void;
}

export function SetNTACLDialog ({ isOpen, onClose, onNTACLSet }: SetNTACLDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SetNTACLFormData>({
    resolver: zodResolver(setNTACLSchema),
    defaultValues: {
      acl: '',
      file: '',
      xattrBackend: '',
      eadbFile: '',
      useNtvfs: '',
      useS3fs: '',
      service: ''
    }
  })

  const { setNTACL } = useNTACLMutations(
    () => {
      onNTACLSet()
      handleClose()
    },
    (error) => toast.error(error)
  )

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const onSubmit = async (data: SetNTACLFormData) => {
    setIsSubmitting(true)
    try {
      const input: SetNTACLInput = {
        acl: data.acl,
        file: data.file,
        xattrBackend: data.xattrBackend || undefined,
        eadbFile: data.eadbFile || undefined,
        useNtvfs: data.useNtvfs || undefined,
        useS3fs: data.useS3fs || undefined,
        service: data.service || undefined
      }

      await setNTACL(input)
      toast.success(`NT ACL set successfully for "${data.file}"`)
    } catch (error) {
      // Error already handled by mutation hook
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set NT ACLs</DialogTitle>
          <DialogDescription>
            Set Windows NT Access Control Lists for a file or directory.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Warning</p>
                  <p className="text-sm">
                    Setting NT ACLs will modify file system permissions. Incorrect ACLs
                    can make files inaccessible or compromise security. Ensure you understand
                    the ACL format before proceeding.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="acl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ACL</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="O:BAG:SYD:(A;;FA;;;SY)(A;;FA;;;BA)..."
                      className="resize-none min-h-[100px] font-mono text-sm"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    NT ACL in SDDL (Security Descriptor Definition Language) format
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Path</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="/path/to/file"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Full path to the file or directory
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="xattrBackend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Xattr Backend</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Extended attribute backend type
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eadbFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EADB File</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Extended attributes database file
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="useNtvfs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Use NTVFS</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Use NT Virtual File System
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="useS3fs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Use S3FS</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Use S3 file system backend
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Optional service name"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Samba service name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">SDDL Format Examples:</h4>
              <div className="space-y-1 text-xs text-muted-foreground font-mono">
                <div><strong>Full Control for System:</strong> O:SYG:SYD:(A;;FA;;;SY)</div>
                <div><strong>Read/Write for Administrators:</strong> (A;;FRFW;;;BA)</div>
                <div><strong>Read Only for Users:</strong> (A;;FR;;;AU)</div>
                <div><strong>Deny Write for Guest:</strong> (D;;FW;;;GU)</div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Setting ACLs...' : 'Set ACLs'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

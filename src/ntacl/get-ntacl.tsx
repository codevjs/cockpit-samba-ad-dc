import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Loader2 } from 'lucide-react';
import { useNTACL } from './hooks/useNTACL';
import { toast } from 'sonner';
import type { GetNTACLInput } from '@/types/samba';

const getNTACLSchema = z.object({
  file: z.string().min(1, 'File path is required'),
  xattrBackend: z.string().optional(),
  eadbFile: z.string().optional(),
  useNtvfs: z.string().optional(),
  useS3fs: z.string().optional(),
  service: z.string().optional(),
});

type GetNTACLFormData = z.infer<typeof getNTACLSchema>;

interface GetNTACLDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GetNTACLDialog({ isOpen, onClose }: GetNTACLDialogProps) {
  const [currentInput, setCurrentInput] = useState<GetNTACLInput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<GetNTACLFormData>({
    resolver: zodResolver(getNTACLSchema),
    defaultValues: {
      file: '',
      xattrBackend: '',
      eadbFile: '',
      useNtvfs: '',
      useS3fs: '',
      service: '',
    },
  });

  const { ntacl, loading, error } = useNTACL(currentInput, !!currentInput);

  const handleClose = () => {
    form.reset();
    setCurrentInput(null);
    onClose();
  };

  const onSubmit = async (data: GetNTACLFormData) => {
    setIsSubmitting(true);
    try {
      const input: GetNTACLInput = {
        file: data.file,
        xattrBackend: data.xattrBackend || undefined,
        eadbFile: data.eadbFile || undefined,
        useNtvfs: data.useNtvfs || undefined,
        useS3fs: data.useS3fs || undefined,
        service: data.service || undefined,
      };
      
      setCurrentInput(input);
      toast.success('Getting NT ACL information...');
    } catch (error) {
      toast.error('Failed to get NT ACL');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Get NT ACLs</DialogTitle>
          <DialogDescription>
            Retrieve Windows NT Access Control Lists for a file or directory.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      disabled={isSubmitting || loading}
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
                        disabled={isSubmitting || loading}
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
                        disabled={isSubmitting || loading}
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
                        disabled={isSubmitting || loading}
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
                        disabled={isSubmitting || loading}
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
                      disabled={isSubmitting || loading}
                    />
                  </FormControl>
                  <FormDescription>
                    Samba service name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Results Section */}
            {loading && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Retrieving NT ACL information...
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Error: {error}
                </AlertDescription>
              </Alert>
            )}

            {ntacl && (
              <div className="space-y-4">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">NT ACL Retrieved</p>
                      <p className="text-sm">File: {ntacl.filePath}</p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Permissions</h4>
                    {ntacl.permissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No permissions found</p>
                    ) : (
                      <div className="space-y-2">
                        {ntacl.permissions.map((perm, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-sm">{perm.trustee}</span>
                              <Badge variant={perm.accessType === 'Allow' ? 'default' : 'destructive'}>
                                {perm.accessType}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {perm.permissions.map((permission, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                            {perm.inheritance.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {perm.inheritance.map((inherit, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {inherit}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Raw ACL Output</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                        {ntacl.rawOutput.join('\n')}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting || loading ? 'Getting ACLs...' : 'Get ACLs'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
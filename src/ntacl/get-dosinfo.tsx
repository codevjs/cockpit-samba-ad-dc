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
import { HardDrive, Loader2 } from 'lucide-react';
import { useDOSInfo } from './hooks/useNTACL';
import { toast } from 'sonner';
import type { GetNTACLInput } from '@/types/samba';

const getDOSInfoSchema = z.object({
  file: z.string().min(1, 'File path is required'),
  xattrBackend: z.string().optional(),
  eadbFile: z.string().optional(),
  useNtvfs: z.string().optional(),
  useS3fs: z.string().optional(),
  service: z.string().optional(),
});

type GetDOSInfoFormData = z.infer<typeof getDOSInfoSchema>;

interface GetDOSInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GetDOSInfoDialog({ isOpen, onClose }: GetDOSInfoDialogProps) {
  const [currentInput, setCurrentInput] = useState<GetNTACLInput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<GetDOSInfoFormData>({
    resolver: zodResolver(getDOSInfoSchema),
    defaultValues: {
      file: '',
      xattrBackend: '',
      eadbFile: '',
      useNtvfs: '',
      useS3fs: '',
      service: '',
    },
  });

  const { dosInfo, loading, error } = useDOSInfo(currentInput, !!currentInput);

  const handleClose = () => {
    form.reset();
    setCurrentInput(null);
    onClose();
  };

  const onSubmit = async (data: GetDOSInfoFormData) => {
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
      toast.success('Getting DOS file information...');
    } catch (error) {
      toast.error('Failed to get DOS info');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Get DOS Information</DialogTitle>
          <DialogDescription>
            Retrieve DOS file attributes and information for a file or directory.
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
            </div>

            {/* Results Section */}
            {loading && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Retrieving DOS file information...
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

            {dosInfo && (
              <div className="space-y-4">
                <Alert>
                  <HardDrive className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">DOS Information Retrieved</p>
                      <p className="text-sm">File: {dosInfo.filePath}</p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">DOS Attributes</h4>
                    {dosInfo.attributes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No DOS attributes found</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {dosInfo.attributes.map((attr, index) => (
                          <Badge key={index} variant="outline">
                            {attr}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Raw DOS Output</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                        {dosInfo.rawOutput.join('\n')}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">Common DOS Attributes:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div><strong>R</strong> - Read-only</div>
                    <div><strong>H</strong> - Hidden</div>
                    <div><strong>S</strong> - System</div>
                    <div><strong>A</strong> - Archive</div>
                    <div><strong>D</strong> - Directory</div>
                    <div><strong>N</strong> - Normal</div>
                    <div><strong>T</strong> - Temporary</div>
                    <div><strong>C</strong> - Compressed</div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting || loading ? 'Getting Info...' : 'Get DOS Info'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
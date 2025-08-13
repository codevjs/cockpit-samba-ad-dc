import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Info, 
  Trash2, 
  CheckCircle, 
  Clock,
  Database
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDNSMutations } from './hooks/useDNS';
import { toast } from 'sonner';
import type { DNSCleanupInput } from '@/types/samba';

const cleanupSchema = z.object({
  server: z.string().min(1, 'Server is required'),
  password: z.string().optional(),
});

type CleanupFormData = z.infer<typeof cleanupSchema>;

interface CleanupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCleanupCompleted: () => void;
  defaultServer?: string | null;
  defaultPassword?: string;
}

export function CleanupDialog({
  isOpen,
  onClose,
  onCleanupCompleted,
  defaultServer,
  defaultPassword,
}: CleanupDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cleanupResults, setCleanupResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CleanupFormData>({
    resolver: zodResolver(cleanupSchema),
    defaultValues: {
      server: defaultServer || '',
      password: defaultPassword || '',
    },
  });

  const { cleanup } = useDNSMutations(
    () => {
      toast.success('DNS cleanup completed successfully');
      onCleanupCompleted();
    },
    (error) => {
      toast.error(`DNS cleanup failed: ${error}`);
    }
  );

  const onSubmit = async (data: CleanupFormData) => {
    setIsSubmitting(true);
    setShowResults(false);
    setCleanupResults([]);
    
    try {
      const input: DNSCleanupInput = {
        server: data.server,
        password: data.password,
      };
      
      const results = await cleanup(input);
      setCleanupResults(results);
      setShowResults(true);
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setCleanupResults([]);
    setShowResults(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            DNS Cleanup
          </DialogTitle>
          <DialogDescription>
            Clean up stale DNS records and resolve configuration issues on the DNS server.
          </DialogDescription>
        </DialogHeader>

        {!showResults && (
          <>
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>DNS Cleanup Process:</strong> This operation will scan the DNS server 
                for stale records, orphaned entries, and configuration inconsistencies, then 
                attempt to resolve them automatically.
              </AlertDescription>
            </Alert>

            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Warning:</strong> DNS cleanup may modify or remove DNS records. 
                Ensure you have proper backups before proceeding. This operation should 
                be performed during maintenance windows.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="server">DNS Server *</Label>
                <Input
                  id="server"
                  {...register('server')}
                  placeholder="dns.domain.com"
                  className={errors.server ? 'border-red-500' : ''}
                />
                {errors.server && (
                  <p className="text-sm text-red-500">{errors.server.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  The DNS server to perform cleanup operations on
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Enter password if required"
                />
                <p className="text-xs text-muted-foreground">
                  Optional password for authentication
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cleanup Operations</CardTitle>
                  <CardDescription>
                    The following operations will be performed during cleanup:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-600" />
                      Scan for orphaned DNS records
                    </li>
                    <li className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-600" />
                      Remove stale pointer records
                    </li>
                    <li className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-600" />
                      Validate zone consistency
                    </li>
                    <li className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-600" />
                      Check for duplicate entries
                    </li>
                    <li className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-600" />
                      Resolve configuration conflicts
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {isSubmitting && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Cleaning up DNS records...</span>
                        <Clock className="h-4 w-4 animate-spin text-blue-600" />
                      </div>
                      <Progress value={undefined} className="w-full" />
                      <p className="text-xs text-muted-foreground">
                        This may take several minutes depending on the number of DNS records.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Cleaning...' : 'Start Cleanup'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {showResults && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Cleanup Completed:</strong> DNS cleanup operation finished successfully.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Cleanup Results
                </CardTitle>
                <CardDescription>
                  Summary of operations performed during DNS cleanup
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cleanupResults.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                    <p className="text-sm font-medium">No Issues Found</p>
                    <p className="text-xs text-muted-foreground">
                      The DNS server is clean and no stale records were detected.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cleanupResults.map((result, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                        <Badge variant="outline" className="mt-0.5">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">{result}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
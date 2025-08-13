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
import { Shield, Loader2 } from 'lucide-react';
import { useDelegation } from './hooks/useDelegation';
import { toast } from 'sonner';

const showDelegationSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
});

type ShowDelegationFormData = z.infer<typeof showDelegationSchema>;

interface ShowDelegationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShowDelegationDialog({ isOpen, onClose }: ShowDelegationDialogProps) {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ShowDelegationFormData>({
    resolver: zodResolver(showDelegationSchema),
    defaultValues: {
      accountName: '',
    },
  });

  const { delegation, loading, error } = useDelegation(currentAccount, !!currentAccount);

  const handleClose = () => {
    form.reset();
    setCurrentAccount(null);
    onClose();
  };

  const onSubmit = async (data: ShowDelegationFormData) => {
    setIsSubmitting(true);
    try {
      setCurrentAccount(data.accountName);
      toast.success('Getting delegation settings...');
    } catch (error) {
      toast.error('Failed to get delegation settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Show Delegation Settings</DialogTitle>
          <DialogDescription>
            View the current delegation configuration for a service account.
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
                      disabled={isSubmitting || loading}
                    />
                  </FormControl>
                  <FormDescription>
                    Name of the service account to query
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
                  Retrieving delegation settings...
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

            {delegation && (
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Delegation Settings Retrieved</p>
                      <p className="text-sm">Account: {delegation.accountName}</p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Delegation Type</h4>
                      <Badge variant="outline" className="text-sm">
                        {delegation.delegationType}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Any Service</h4>
                      <Badge variant={delegation.anyService ? "destructive" : "default"}>
                        {delegation.anyService ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Any Protocol</h4>
                      <Badge variant={delegation.anyProtocol ? "destructive" : "default"}>
                        {delegation.anyProtocol ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Services Count</h4>
                      <Badge variant="secondary">
                        {delegation.allowedServices.length}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Allowed Services</h4>
                    {delegation.allowedServices.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No specific services configured</p>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {delegation.allowedServices.map((service, index) => (
                          <div key={index} className="bg-muted p-2 rounded">
                            <code className="text-sm">{service}</code>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {delegation.protocols.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Protocols</h4>
                      <div className="flex flex-wrap gap-2">
                        {delegation.protocols.map((protocol, index) => (
                          <Badge key={index} variant="secondary">
                            {protocol}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Raw Output</h4>
                    <div className="bg-muted/50 p-4 rounded-lg max-h-48 overflow-y-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {delegation.rawOutput.join('\n')}
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
                {isSubmitting || loading ? 'Getting Settings...' : 'Show Settings'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
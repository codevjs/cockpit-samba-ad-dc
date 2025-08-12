import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { z } from 'zod';

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useComputerMutations } from './hooks/useComputerMutations';
import { ErrorToast, SuccessToast } from '@/common';
import type { SambaComputer } from '@/types/samba';

// Delete computer schema
const deleteComputerSchema = z.object({
    computerName: z.string().min(1, 'Computer name is required'),
    confirmComputerName: z.string().min(1, 'Please type the computer name to confirm'),
}).refine((data) => data.computerName === data.confirmComputerName, {
    message: "Computer names don't match",
    path: ["confirmComputerName"],
});

type DeleteComputerFormData = z.infer<typeof deleteComputerSchema>;

interface DeleteComputerDialogProps {
    computer?: SambaComputer;
    computerName?: string;
    onComputerDeleted?: (computerName: string) => void;
    trigger?: React.ReactNode;
}

export default function DeleteComputerDialog({ 
    computer, 
    computerName: propComputerName, 
    onComputerDeleted, 
    trigger 
}: DeleteComputerDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showToasts, setShowToasts] = useState({ success: false, error: false });

    const computerName = computer?.name || propComputerName || '';
    const displayName = computer?.name || computerName;

    const form = useForm<DeleteComputerFormData>({
        resolver: zodResolver(deleteComputerSchema),
        defaultValues: {
            computerName: computerName,
            confirmComputerName: '',
        },
    });

    const { delete: deleteComputer, deleting, error, clearError } = useComputerMutations({
        onSuccess: (action, result) => {
            if (action === 'delete') {
                setShowToasts({ success: true, error: false });
                setIsOpen(false);
                form.reset();
                onComputerDeleted?.(computerName);
            }
        },
        onError: () => {
            setShowToasts({ success: false, error: true });
        },
    });

    const confirmComputerName = form.watch('confirmComputerName');
    const canDelete = confirmComputerName === computerName && !deleting;

    const onSubmit = async (data: DeleteComputerFormData) => {
        clearError();
        await deleteComputer(data.computerName);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            form.reset();
            clearError();
        }
    };

    return (
        <>
            {showToasts.error && error && (
                <ErrorToast 
                    errorMessage={error} 
                    closeModal={() => setShowToasts({ ...showToasts, error: false })} 
                />
            )}
            {showToasts.success && (
                <SuccessToast 
                    successMessage={`Computer "${computerName}" deleted successfully.`} 
                    closeModal={() => setShowToasts({ ...showToasts, success: false })} 
                />
            )}

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    {trigger || (
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Computer
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <DialogTitle>Delete Computer Account</DialogTitle>
                        </div>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the computer account from Active Directory.
                        </DialogDescription>
                    </DialogHeader>

                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Warning:</strong> Deleting this computer account will prevent the computer from logging into the domain until it is rejoined.
                        </AlertDescription>
                    </Alert>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="computerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Computer Name</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="Enter computer name"
                                                disabled={!!computer}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmComputerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Computer Name</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder={`Type "${displayName}" to confirm`}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Type the computer name exactly as shown above to confirm deletion
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {computer && (
                                <div className="rounded-lg bg-muted p-4 space-y-2">
                                    <div className="font-medium">Computer Details:</div>
                                    <div className="text-sm space-y-1">
                                        <div><strong>Name:</strong> {computer.name}</div>
                                        {computer.dnsHostName && (
                                            <div><strong>DNS Name:</strong> {computer.dnsHostName}</div>
                                        )}
                                        {computer.operatingSystem && (
                                            <div><strong>OS:</strong> {computer.operatingSystem}</div>
                                        )}
                                        <div><strong>Status:</strong> {computer.enabled ? 'Enabled' : 'Disabled'}</div>
                                    </div>
                                </div>
                            )}

                            <DialogFooter>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="destructive" 
                                    disabled={!canDelete}
                                >
                                    {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Delete Computer
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
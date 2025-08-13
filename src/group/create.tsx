import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Users } from 'lucide-react';
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { useGroupMutations } from './hooks/useGroupMutations';
import type { CreateGroupInput } from '@/types/samba';

const createGroupSchema = z.object({
    name: z.string()
        .min(1, 'Group name is required')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Group name can only contain letters, numbers, underscores, and hyphens'),
    displayName: z.string().optional(),
    description: z.string().optional(),
    groupType: z.enum(['Security', 'Distribution']),
    groupScope: z.enum(['DomainLocal', 'Global', 'Universal']).optional(),
    organizationalUnit: z.string().optional(),
});

type CreateGroupFormData = z.infer<typeof createGroupSchema>;

interface CreateGroupDialogProps {
    onGroupCreated?: (group: any) => void;
    trigger?: React.ReactNode;
}

export default function CreateGroupDialog({ onGroupCreated, trigger }: CreateGroupDialogProps) {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<CreateGroupFormData>({
        resolver: zodResolver(createGroupSchema),
        defaultValues: {
            name: '',
            displayName: '',
            description: '',
            groupType: 'Security',
            groupScope: 'Global',
            organizationalUnit: '',
        },
    });

    const { createGroup, isLoading, error } = useGroupMutations(
        () => {
            // Success callback
            setIsOpen(false);
            form.reset();
            onGroupCreated?.({});
        },
        (errorMessage: string) => {
            // Error callback is already handled by the hook
            console.error('Create group error:', errorMessage);
        }
    );

    const onSubmit = async (data: CreateGroupFormData) => {
        await createGroup(data);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            form.reset();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Group
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Group</DialogTitle>
                    <DialogDescription>
                        Create a new Active Directory group. Fill in the required information below.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Group Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter group name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Unique name for the group (letters, numbers, underscore, hyphen only)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter display name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Friendly name for the group
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Enter group description" 
                                            className="resize-none" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Optional description of the group's purpose
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="groupType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Group Type *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select group type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Security">Security Group</SelectItem>
                                                <SelectItem value="Distribution">Distribution Group</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Security groups can be used for permissions
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="groupScope"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Group Scope</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select group scope" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="DomainLocal">Domain Local</SelectItem>
                                                <SelectItem value="Global">Global</SelectItem>
                                                <SelectItem value="Universal">Universal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Scope determines where the group can be used
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="organizationalUnit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organizational Unit</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter OU (e.g., ou=Groups,dc=example,dc=com)" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Leave empty to use the default Groups container
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => handleOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Group
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
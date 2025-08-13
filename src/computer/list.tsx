import React, { useState } from 'react';
import { Search, Monitor, Power, PowerOff, MoreHorizontal, RefreshCw } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useComputers } from './hooks/useComputers';
import { useComputerMutations } from './hooks/useComputerMutations';
import { ErrorToast, SuccessToast } from '@/common';
import type { SambaComputer } from '@/types/samba';

// Import dialogs that will be created
import CreateComputerDialog from './create';
import DeleteComputerDialog from './delete';
import MoveComputerDialog from './move';
import ShowComputerDialog from './show';

interface ComputerListProps {
    computers?: SambaComputer[];
    loading?: boolean;
    error?: string | null;
    onRefresh?: () => void;
}

export default function ComputerList({ 
    computers: propComputers,
    loading: propLoading,
    error: propError,
    onRefresh: propOnRefresh
}: ComputerListProps) {
    const [showToasts, setShowToasts] = useState({ success: false, error: false });
    const [toastMessage, setToastMessage] = useState('');

    // Use either prop data or hook data
    const hookData = useComputers({
        initialFilters: {},
        autoRefresh: true,
    });

    const computers = propComputers || hookData.filteredComputers;
    const loading = propLoading !== undefined ? propLoading : hookData.loading;
    const error = propError !== undefined ? propError : hookData.error;
    const onRefresh = propOnRefresh || hookData.refreshComputers;
    const { updateFilters, filters } = hookData;

    const { enable, disable, enablingDisabling, error: mutationError } = useComputerMutations({
        onSuccess: (action, data) => {
            const computerName = data?.name || data?.computerName;
            let message = '';
            
            switch (action) {
                case 'enable':
                    message = `Computer "${computerName}" enabled successfully.`;
                    break;
                case 'disable':
                    message = `Computer "${computerName}" disabled successfully.`;
                    break;
                default:
                    message = `Operation completed successfully for "${computerName}".`;
            }
            
            setToastMessage(message);
            setShowToasts({ success: true, error: false });
            onRefresh?.();
        },
        onError: (action, errorMsg) => {
            setToastMessage(errorMsg);
            setShowToasts({ success: false, error: true });
        },
    });

    const handleSearch = (query: string) => {
        updateFilters({ search: query });
    };

    const handleEnableDisable = async (computer: SambaComputer) => {
        if (computer.enabled) {
            await disable(computer.name);
        } else {
            await enable(computer.name);
        }
    };

    const formatLastLogon = (lastLogon?: Date) => {
        if (!lastLogon) return 'Never';
        
        const now = new Date();
        const diffInMs = now.getTime() - lastLogon.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 30) return `${diffInDays} days ago`;
        
        return lastLogon.toLocaleDateString();
    };

    if (loading && computers.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1">
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-4 w-[120px]" />
                            <Skeleton className="h-4 w-[80px]" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {showToasts.error && (mutationError || error) && (
                <ErrorToast 
                    errorMessage={mutationError || error || 'An error occurred'} 
                    closeModal={() => setShowToasts({ ...showToasts, error: false })} 
                />
            )}
            {showToasts.success && (
                <SuccessToast 
                    successMessage={toastMessage} 
                    closeModal={() => setShowToasts({ ...showToasts, success: false })} 
                />
            )}

            {/* Search and Actions */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search computers by name, DNS name, or description..."
                        value={filters.search || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {error && (
                <Alert>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Computer Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Computer Name</TableHead>
                            <TableHead>DNS Host Name</TableHead>
                            <TableHead>Operating System</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Logon</TableHead>
                            <TableHead className="w-[50px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {computers.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    <Monitor className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                    No computers found
                                </TableCell>
                            </TableRow>
                        ) : (
                            computers.map((computer) => (
                                <TableRow key={computer.name}>
                                    <TableCell className="font-medium">{computer.name}</TableCell>
                                    <TableCell>{computer.dnsHostName || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{computer.operatingSystem || 'Unknown'}</span>
                                            {computer.operatingSystemVersion && (
                                                <span className="text-xs text-muted-foreground">
                                                    {computer.operatingSystemVersion}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={computer.enabled ? 'default' : 'destructive'}>
                                            {computer.enabled ? (
                                                <>
                                                    <Power className="mr-1 h-3 w-3" />
                                                    Enabled
                                                </>
                                            ) : (
                                                <>
                                                    <PowerOff className="mr-1 h-3 w-3" />
                                                    Disabled
                                                </>
                                            )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {formatLastLogon(computer.lastLogon)}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <ShowComputerDialog 
                                                    computer={computer}
                                                    trigger={
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                            View Details
                                                        </DropdownMenuItem>
                                                    }
                                                />
                                                
                                                <DropdownMenuItem 
                                                    onClick={() => handleEnableDisable(computer)}
                                                    disabled={enablingDisabling}
                                                >
                                                    {computer.enabled ? 'Disable' : 'Enable'}
                                                </DropdownMenuItem>

                                                <MoveComputerDialog 
                                                    computer={computer}
                                                    onComputerMoved={onRefresh}
                                                    trigger={
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                            Move to OU
                                                        </DropdownMenuItem>
                                                    }
                                                />

                                                <DropdownMenuSeparator />

                                                <DeleteComputerDialog 
                                                    computer={computer}
                                                    onComputerDeleted={onRefresh}
                                                    trigger={
                                                        <DropdownMenuItem 
                                                            onSelect={(e) => e.preventDefault()}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            Delete Computer
                                                        </DropdownMenuItem>
                                                    }
                                                />
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Summary Info */}
            {computers.length > 0 && (
                <div className="text-sm text-muted-foreground">
                    Showing {computers.length} computers
                </div>
            )}
        </div>
    );
}
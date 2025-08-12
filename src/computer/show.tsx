import React, { useState } from 'react';
import { Eye, Monitor, Calendar, HardDrive, Network, Building, Copy } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import type { SambaComputer } from '@/types/samba';

interface ShowComputerDialogProps {
    computer?: SambaComputer;
    computerName?: string;
    trigger?: React.ReactNode;
}

export default function ShowComputerDialog({ 
    computer, 
    computerName: propComputerName, 
    trigger 
}: ShowComputerDialogProps) {
    const [isOpen, setIsOpen] = useState(false);

    const computerName = computer?.name || propComputerName || '';
    const displayName = computer?.name || computerName;

    const handleCopyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const formatDate = (date?: Date) => {
        if (!date) return 'Not available';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const formatLastLogon = (lastLogon?: Date) => {
        if (!lastLogon) return 'Never';
        
        const now = new Date();
        const diffInMs = now.getTime() - lastLogon.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 30) return `${diffInDays} days ago`;
        
        return formatDate(lastLogon);
    };

    if (!computer) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    {trigger || (
                        <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Computer Details</DialogTitle>
                        <DialogDescription>
                            Computer information not available. Please provide a computer object or ensure the computer exists.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-primary" />
                        <DialogTitle>Computer Details</DialogTitle>
                    </div>
                    <DialogDescription>
                        Detailed information for computer account "{displayName}"
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Monitor className="h-4 w-4" />
                                        Basic Information
                                    </CardTitle>
                                </div>
                                <Badge variant={computer.enabled ? 'default' : 'destructive'}>
                                    {computer.enabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Computer Name</div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{computer.name}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCopyToClipboard(computer.name)}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">DNS Host Name</div>
                                    <div className="flex items-center gap-2">
                                        <span>{computer.dnsHostName || 'Not set'}</span>
                                        {computer.dnsHostName && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopyToClipboard(computer.dnsHostName!)}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {computer.description && (
                                <>
                                    <Separator />
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
                                        <p className="text-sm">{computer.description}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* System Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HardDrive className="h-4 w-4" />
                                System Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Operating System</div>
                                    <div>{computer.operatingSystem || 'Unknown'}</div>
                                </div>
                                {computer.operatingSystemVersion && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-1">OS Version</div>
                                        <div>{computer.operatingSystemVersion}</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Network & Location */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Network & Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Distinguished Name</div>
                                    <div className="font-mono text-xs bg-muted p-2 rounded break-all">
                                        {computer.distinguishedName}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="ml-2"
                                            onClick={() => handleCopyToClipboard(computer.distinguishedName)}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                {computer.organizationalUnit && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-1">Organizational Unit</div>
                                        <div>{computer.organizationalUnit}</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Activity Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Created</div>
                                    <div>{formatDate(computer.createdAt)}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Last Logon</div>
                                    <div>{formatLastLogon(computer.lastLogon)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Network className="h-4 w-4" />
                                Account Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="font-medium">Current Status</div>
                                    <div className="text-sm text-muted-foreground">
                                        This computer account is currently {computer.enabled ? 'enabled' : 'disabled'} in Active Directory
                                    </div>
                                </div>
                                <Badge variant={computer.enabled ? 'default' : 'destructive'} className="ml-4">
                                    {computer.enabled ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
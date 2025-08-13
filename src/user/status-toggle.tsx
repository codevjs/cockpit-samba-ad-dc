import React, { useState } from 'react';
import { Shield, ShieldCheck, ShieldX, UserCheck, UserX } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

import { useUserMutations } from './hooks/useUserMutations';
import { ErrorToast, SuccessToast } from '@/common';
import type { SambaUser } from '@/types/samba';

interface UserStatusToggleProps {
    user?: SambaUser;
    username?: string;
    currentStatus?: boolean;
    onStatusChanged?: (username: string, newStatus: boolean) => void;
    trigger?: React.ReactNode;
    variant?: 'button' | 'badge' | 'icon';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function UserStatusToggle({ 
    user, 
    username: propUsername, 
    currentStatus, 
    onStatusChanged,
    trigger,
    variant = 'button',
    size = 'sm'
}: UserStatusToggleProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showToasts, setShowToasts] = useState({ success: false, error: false });

    const username = user?.username || propUsername || '';
    const displayName = user?.displayName || user?.username || username;
    const isEnabled = user?.enabled ?? currentStatus ?? true;
    const targetStatus = !isEnabled; // What we want to change to
    const action = targetStatus ? 'enable' : 'disable';
    const actionPastTense = targetStatus ? 'enabled' : 'disabled';

    const { 
        enable, 
        disable, 
        enablingDisabling, 
        error, 
        clearError 
    } = useUserMutations({
        onSuccess: (actionType, updatedUser) => {
            if (actionType === 'enable' || actionType === 'disable') {
                setShowToasts({ success: true, error: false });
                setIsOpen(false);
                onStatusChanged?.(username, updatedUser.enabled);
            }
        },
        onError: () => {
            setShowToasts({ success: false, error: true });
        },
    });

    const handleStatusChange = async () => {
        clearError();
        
        if (targetStatus) {
            await enable(username);
        } else {
            await disable(username);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            clearError();
        }
    };

    const renderTrigger = () => {
        if (trigger) return trigger;

        switch (variant) {
            case 'badge':
                return (
                    <Badge 
                        variant={isEnabled ? 'default' : 'destructive'}
                        className="cursor-pointer hover:opacity-80"
                    >
                        {isEnabled ? (
                            <>
                                <ShieldCheck className="mr-1 h-3 w-3" />
                                Enabled
                            </>
                        ) : (
                            <>
                                <ShieldX className="mr-1 h-3 w-3" />
                                Disabled
                            </>
                        )}
                    </Badge>
                );
            
            case 'icon':
                return (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {isEnabled ? (
                            <UserCheck className="h-4 w-4 text-green-600" />
                        ) : (
                            <UserX className="h-4 w-4 text-red-600" />
                        )}
                    </Button>
                );
            
            default: // button
                return (
                    <Button 
                        variant={targetStatus ? "default" : "destructive"} 
                        size={size}
                    >
                        {targetStatus ? (
                            <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Enable User
                            </>
                        ) : (
                            <>
                                <UserX className="mr-2 h-4 w-4" />
                                Disable User
                            </>
                        )}
                    </Button>
                );
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
                    successMessage={`User "${username}" has been ${actionPastTense} successfully.`} 
                    closeModal={() => setShowToasts({ ...showToasts, success: false })} 
                />
            )}

            <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
                <AlertDialogTrigger asChild>
                    {renderTrigger()}
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <AlertDialogTitle>
                                {targetStatus ? 'Enable' : 'Disable'} User Account
                            </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p>
                                    Are you sure you want to {action} the user account for{' '}
                                    <strong>"{displayName}"</strong>?
                                </p>
                                
                                {targetStatus ? (
                                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                        <p className="text-sm text-green-800">
                                            <strong>Enabling this account will:</strong>
                                        </p>
                                        <ul className="text-sm text-green-700 list-disc list-inside mt-1 space-y-1">
                                            <li>Allow the user to log in to the domain</li>
                                            <li>Restore access to domain resources</li>
                                            <li>Reactivate all assigned permissions</li>
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                                        <p className="text-sm text-orange-800">
                                            <strong>Disabling this account will:</strong>
                                        </p>
                                        <ul className="text-sm text-orange-700 list-disc list-inside mt-1 space-y-1">
                                            <li>Prevent the user from logging in</li>
                                            <li>Block access to domain resources</li>
                                            <li>Maintain the account and its data</li>
                                            <li>Allow the account to be re-enabled later</li>
                                        </ul>
                                    </div>
                                )}

                                <p className="text-xs text-muted-foreground">
                                    Note: This action can be reversed at any time.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel 
                            onClick={() => handleOpenChange(false)}
                            disabled={enablingDisabling}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleStatusChange}
                            disabled={enablingDisabling}
                            className={targetStatus ? 
                                "bg-primary text-primary-foreground hover:bg-primary/90" : 
                                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            }
                        >
                            {enablingDisabling ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                    {targetStatus ? 'Enabling...' : 'Disabling...'}
                                </>
                            ) : (
                                <>
                                    {targetStatus ? (
                                        <UserCheck className="mr-2 h-4 w-4" />
                                    ) : (
                                        <UserX className="mr-2 h-4 w-4" />
                                    )}
                                    {targetStatus ? 'Enable User' : 'Disable User'}
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

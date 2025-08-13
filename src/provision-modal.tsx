import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Server, Shield, Network, Database } from 'lucide-react';

import cockpit from 'cockpit';

interface ProvisionFormData {
    domain: string;
    adminPassword: string;
    confirmPassword: string;
    dnsForwarder: string;
}

interface ProvisionState {
    isOpen: boolean;
    isProvisioning: boolean;
    progress: number;
    currentStep: string;
    error?: string;
    formData: ProvisionFormData;
    formErrors: Partial<ProvisionFormData>;
}

const initialFormData: ProvisionFormData = {
    domain: '',
    adminPassword: '',
    confirmPassword: '',
    dnsForwarder: '8.8.8.8',
};

const provisionSteps = [
    { id: 1, name: 'Validation', description: 'Validating system requirements' },
    { id: 2, name: 'Configuration', description: 'Preparing domain configuration' },
    { id: 3, name: 'Provisioning', description: 'Creating Active Directory structure' },
    { id: 4, name: 'DNS Setup', description: 'Configuring DNS services' },
    { id: 5, name: 'Finalization', description: 'Completing domain controller setup' },
];

export default function Provision(): JSX.Element {
    const [state, setState] = useState<ProvisionState>({
        isOpen: false,
        isProvisioning: false,
        progress: 0,
        currentStep: '',
        formData: initialFormData,
        formErrors: {},
    });

    const validateForm = (): boolean => {
        const errors: Partial<ProvisionFormData> = {};

        if (!state.formData.domain.trim()) {
            errors.domain = 'Domain name is required';
        } else if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(state.formData.domain.trim())) {
            errors.domain = 'Please enter a valid domain name (e.g., company.local)';
        }

        if (!state.formData.adminPassword) {
            errors.adminPassword = 'Administrator password is required';
        } else if (state.formData.adminPassword.length < 8) {
            errors.adminPassword = 'Password must be at least 8 characters long';
        }

        if (state.formData.adminPassword !== state.formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (!state.formData.dnsForwarder.trim()) {
            errors.dnsForwarder = 'DNS forwarder is required';
        } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(state.formData.dnsForwarder.trim())) {
            errors.dnsForwarder = 'Please enter a valid IP address';
        }

        setState(prev => ({ ...prev, formErrors: errors }));
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field: keyof ProvisionFormData, value: string): void => {
        setState(prev => ({
            ...prev,
            formData: { ...prev.formData, [field]: value },
            formErrors: { ...prev.formErrors, [field]: undefined }
        }));
    };

    const startProvisioning = async (): Promise<void> => {
        if (!validateForm()) return;

        setState(prev => ({
            ...prev,
            isProvisioning: true,
            progress: 0,
            error: undefined
        }));

        try {
            const { domain, adminPassword, dnsForwarder } = state.formData;

            for (let i = 0; i < provisionSteps.length; i++) {
                const step = provisionSteps[i];
                setState(prev => ({
                    ...prev,
                    currentStep: step.description,
                    progress: ((i + 1) / provisionSteps.length) * 100
                }));

                // Simulate provisioning delay
                await new Promise(resolve => setTimeout(resolve, 2000));

                if (i === provisionSteps.length - 1) {
                    // Execute actual provisioning command
                    const command = `samba-tool domain provision --realm=${domain.toUpperCase()} --domain=${domain.split('.')[0].toUpperCase()} --adminpass="${adminPassword}" --dns-backend=SAMBA_INTERNAL --option="dns forwarder = ${dnsForwarder}"`;
                    await cockpit.script(command, { superuser: true, err: "message" });
                }
            }

            // Refresh the page to show the new AD DC status
            window.location.reload();
        } catch (error: any) {
            console.error('Provisioning failed:', error);
            setState(prev => ({
                ...prev,
                isProvisioning: false,
                error: error?.message || 'Failed to provision Active Directory Domain Controller'
            }));
        }
    };

    const handleClose = (): void => {
        if (!state.isProvisioning) {
            setState(prev => ({
                ...prev,
                isOpen: false,
                formData: initialFormData,
                formErrors: {},
                error: undefined
            }));
        }
    };

    return (
        <Dialog open={state.isOpen} onOpenChange={(open) => setState(prev => ({ ...prev, isOpen: open }))}>
            <DialogTrigger asChild>
                <Button variant="default" size="lg" className="w-full">
                    <Server className="mr-2 h-5 w-5" />
                    Provision Active Directory
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Provision Active Directory Domain Controller
                    </DialogTitle>
                    <DialogDescription>
                        Set up a new Active Directory Domain Controller on this system. This process will configure
                        Samba as a domain controller with DNS services.
                    </DialogDescription>
                </DialogHeader>

                {state.error && (
                    <Card className="border-destructive bg-destructive/5">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">Provisioning Failed</span>
                            </div>
                            <p className="text-sm text-destructive mt-1">{state.error}</p>
                        </CardContent>
                    </Card>
                )}

                {state.isProvisioning
? (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Provisioning in Progress</CardTitle>
                <CardDescription>{state.currentStep}</CardDescription>
            </CardHeader>
            <CardContent>
                <Progress value={state.progress} className="w-full" />
                <div className="text-sm text-muted-foreground mt-2 text-center">
                    {Math.round(state.progress)}% Complete
                </div>
            </CardContent>
        </Card>

        <div className="space-y-2">
            {provisionSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                        index < (state.progress / 100) * provisionSteps.length
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    }`}>
                        {step.id}
                    </div>
                    <div className="flex-1">
                        <div className="font-medium text-sm">{step.name}</div>
                        <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                </div>
                            ))}
        </div>
    </div>
                )
: (
    <div className="space-y-6">
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Important Notice</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This operation will configure this server as an Active Directory Domain Controller.
                    Make sure you have proper backups and understand the implications.
                </p>
            </CardContent>
        </Card>

        <div className="grid gap-4">
            <div className="space-y-2">
                <Label htmlFor="domain">Domain Name *</Label>
                <Input
                                    id="domain"
                                    placeholder="company.local"
                                    value={state.formData.domain}
                                    onChange={(e) => handleInputChange('domain', e.target.value)}
                                    className={state.formErrors.domain ? 'border-destructive' : ''}
                                />
                {state.formErrors.domain && (
                <p className="text-sm text-destructive">{state.formErrors.domain}</p>
                                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="adminPassword">Administrator Password *</Label>
                <Input
                                    id="adminPassword"
                                    type="password"
                                    placeholder="Enter a strong password"
                                    value={state.formData.adminPassword}
                                    onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                                    className={state.formErrors.adminPassword ? 'border-destructive' : ''}
                                />
                {state.formErrors.adminPassword && (
                <p className="text-sm text-destructive">{state.formErrors.adminPassword}</p>
                                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm the password"
                                    value={state.formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    className={state.formErrors.confirmPassword ? 'border-destructive' : ''}
                                />
                {state.formErrors.confirmPassword && (
                <p className="text-sm text-destructive">{state.formErrors.confirmPassword}</p>
                                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="dnsForwarder">DNS Forwarder</Label>
                <Input
                                    id="dnsForwarder"
                                    placeholder="8.8.8.8"
                                    value={state.formData.dnsForwarder}
                                    onChange={(e) => handleInputChange('dnsForwarder', e.target.value)}
                                    className={state.formErrors.dnsForwarder ? 'border-destructive' : ''}
                                />
                {state.formErrors.dnsForwarder && (
                <p className="text-sm text-destructive">{state.formErrors.dnsForwarder}</p>
                                )}
                <p className="text-xs text-muted-foreground">
                    IP address of upstream DNS server for external lookups
                </p>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
                <Network className="h-5 w-5 mx-auto text-primary mb-1" />
                <div className="text-xs font-medium">DNS</div>
                <Badge variant="secondary" className="text-xs">Included</Badge>
            </div>
            <div className="text-center">
                <Database className="h-5 w-5 mx-auto text-primary mb-1" />
                <div className="text-xs font-medium">LDAP</div>
                <Badge variant="secondary" className="text-xs">Included</Badge>
            </div>
            <div className="text-center">
                <Shield className="h-5 w-5 mx-auto text-primary mb-1" />
                <div className="text-xs font-medium">Kerberos</div>
                <Badge variant="secondary" className="text-xs">Included</Badge>
            </div>
        </div>
    </div>
                )}

                <DialogFooter>
                    {!state.isProvisioning && (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button onClick={startProvisioning}>
                                Start Provisioning
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

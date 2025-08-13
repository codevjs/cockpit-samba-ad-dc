import React, { useState, useEffect } from 'react';
import Provision from './provision-modal';
import Main from './main';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import cockpit from 'cockpit';

interface ServerRoleState {
    addcStatus: boolean | undefined;
    loading: boolean;
    error?: string;
}

export default function GetServerRole(): JSX.Element {
    const [state, setState] = useState<ServerRoleState>({
        addcStatus: undefined,
        loading: true,
        error: undefined
    });

    useEffect(() => {
        const checkServerRole = async (): Promise<void> => {
            try {
                setState(prev => ({ ...prev, loading: true, error: undefined }));

                const command = 'samba-tool testparm --parameter-name=serverrole';
                const data = await cockpit.script(command, { superuser: true, err: "message" });

                const isAdDc = data.includes("active directory domain controller");
                setState({
                    addcStatus: isAdDc,
                    loading: false,
                    error: undefined
                });
            } catch (exception: any) {
                console.error('Failed to check AD DC status:', exception);
                setState({
                    addcStatus: false,
                    loading: false,
                    error: exception?.message || 'Failed to check server role'
                });
            }
        };

        checkServerRole();
    }, []);

    const renderContent = (): JSX.Element => {
        if (state.loading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                    <div className="w-full max-w-md space-y-4">
                        <Progress value={undefined} className="w-full" />
                        <div className="text-center">
                            <h2 className="text-lg font-semibold">Loading...</h2>
                            <p className="text-muted-foreground">Checking Samba AD DC status</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (state.error) {
            return (
                <Card className="max-w-md mx-auto mt-8">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <div className="text-destructive text-xl">⚠️</div>
                            <h2 className="text-lg font-semibold text-destructive">Error</h2>
                            <p className="text-sm text-muted-foreground">{state.error}</p>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        if (state.addcStatus) {
            return <Main />;
        } else {
            return (
                <div className="container mx-auto px-4 py-8">
                    <Card className="max-w-md mx-auto">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <div className="text-muted-foreground text-xl">🏢</div>
                                <h1 className="text-xl font-semibold">No AD DC Found</h1>
                                <p className="text-sm text-muted-foreground">
                                    No Active Directory Domain Controller is currently configured on this system.
                                </p>
                                <Provision />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {renderContent()}
        </div>
    );
}

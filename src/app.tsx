import React from 'react';
import ServerRole from './ad-dc-status';
import './globals.css';

export function Application(): JSX.Element {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <ServerRole />
        </div>
    );
}

import "../lib/patternfly-4-cockpit.scss";
import React from 'react';
import { createRoot } from 'react-dom/client';
import Create from './create';
import Remove from './remove';
import CreateSubnet from './create_subnet';
import RemoveSubnet from './remove_subnet';
import SetSite from './set-site';
import './index.css';
import { BackButton } from '../common';
import { Toolbar, ToolbarItem, ToolbarGroup, ToolbarContent } from '@patternfly/react-core';
import "../lib/patternfly-4-overrides.scss";

export default function Sites() {
    return (
        <div>
            <BackButton />
            <Toolbar>
                <ToolbarContent>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <Create />
                        </ToolbarItem>
                        <ToolbarItem>
                            <Remove />
                        </ToolbarItem>
                        <ToolbarItem>
                            <CreateSubnet />
                        </ToolbarItem>
                        <ToolbarItem>
                            <RemoveSubnet />
                        </ToolbarItem>
                        <ToolbarItem>
                            <SetSite />
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarContent>
            </Toolbar>
        </div>
    );
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("sites");
    const root = createRoot(container);
    root.render(<Sites />);
});

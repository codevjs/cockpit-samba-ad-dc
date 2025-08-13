import "../lib/patternfly-4-cockpit.scss";
import React from 'react';
import { createRoot } from 'react-dom/client';
import DSHeuristics from './dsheuristics';
import Show from './show';
import { Toolbar, ToolbarItem, ToolbarGroup, ToolbarContent } from '@patternfly/react-core';
import { BackButton } from '../common';
import "../lib/patternfly-4-overrides.scss";

export default function Forest() {
    return (
        <>
            <BackButton />
            <Toolbar>
                <ToolbarContent>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <DSHeuristics />
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarContent>
            </Toolbar>
            <Show />
        </>
    );
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("forest");
    const root = createRoot(container);
    root.render(<Forest />);
});

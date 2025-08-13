import "../lib/patternfly-4-cockpit.scss";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toolbar, ToolbarItem, ToolbarGroup, ToolbarContent } from '@patternfly/react-core';
import { BackButton } from '../common';

// Import modernized components
import GroupList from './list';
import CreateGroupDialog from './create';
import DeleteGroupDialog from './delete';
import GroupDetailsDialog from './show';
import MoveGroupDialog from './move';
import ListMembersDialog from './listmembers';
import RemoveMembersDialog from './removemembers';

import "../lib/patternfly-4-overrides.scss";

export const GroupManagement: React.FC = () => {
    const [refreshTrigger, setRefreshTrigger] = React.useState(0);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div>
            <BackButton />
            <Toolbar>
                <ToolbarContent>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <CreateGroupDialog onGroupCreated={handleRefresh} />
                        </ToolbarItem>
                        <ToolbarItem>
                            <DeleteGroupDialog onGroupDeleted={handleRefresh} />
                        </ToolbarItem>
                        <ToolbarItem>
                            <GroupDetailsDialog />
                        </ToolbarItem>
                    </ToolbarGroup>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <MoveGroupDialog onGroupMoved={handleRefresh} />
                        </ToolbarItem>
                        <ToolbarItem>
                            <ListMembersDialog />
                        </ToolbarItem>
                        <ToolbarItem>
                            <RemoveMembersDialog onMembersRemoved={handleRefresh} />
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarContent>
            </Toolbar>
            <GroupList key={refreshTrigger} />
        </div>
    );
};

// Export individual components for use elsewhere
export {
    GroupList,
    CreateGroupDialog,
    DeleteGroupDialog,
    GroupDetailsDialog,
    MoveGroupDialog,
    ListMembersDialog,
    RemoveMembersDialog
};

// Default export for the main component
export default GroupManagement;

// DOM mounting for standalone usage
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("group");
    if (container) {
        const root = createRoot(container);
        root.render(<GroupManagement />);
    }
});
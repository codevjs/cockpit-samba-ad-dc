import React from 'react';
import { createRoot } from 'react-dom/client';
import './tailwind.css';
// import { Toolbar, ToolbarItem, ToolbarGroup, ToolbarContent } from '@patternfly/react-core';
import Create from './create';
import List from './list';
import Enable from './enable';
import Disable from './disable';
import Delete from './delete';
import Move from './move';
import Show from './show';
import Password from './password';
import SetExpiry from './setexpiry';
import SetPassword from './setpassword';

function User() {
    return (
        <>
            {/* <BackButton /> */}
            {/* <Toolbar>
                <ToolbarContent>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <Create />
                        </ToolbarItem>
                        <ToolbarItem>
                            <Delete />
                        </ToolbarItem>
                        <ToolbarItem>
                            <Enable />
                        </ToolbarItem>
                        <ToolbarItem>
                            <Disable />
                        </ToolbarItem>
                        <ToolbarItem>
                            <Move />
                        </ToolbarItem>
                        <ToolbarItem>
                            <Show />
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarContent>
                <ToolbarContent>
                    <ToolbarItem>
                        <Password />
                    </ToolbarItem>
                    <ToolbarItem>
                        <SetExpiry />
                    </ToolbarItem>
                    <ToolbarItem>
                        <SetPassword />
                    </ToolbarItem>
                </ToolbarContent>
            </Toolbar> */}
            <List />
            <Create />
            <Delete />
            <Enable />
            <Disable />
            <Move />
            <Show />
            <Password />
            <SetExpiry />
            <SetPassword />
        </>
    );
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("user");
    const root = createRoot(container);
    root.render(<User />);
});

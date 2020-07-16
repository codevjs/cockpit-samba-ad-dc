import "../lib/patternfly-4-cockpit.scss";
import React from "react";
import ReactDOM from "react-dom";
import AddService from './add-service';
import AnyProtocol from './any-protocol';
import AnyService from './any-service';
import DeleteService from './delete-service';
import Show from './show.js';
import {
    Toolbar,
    ToolbarItem,
    ToolbarGroup,
    ToolbarContent,
} from "@patternfly/react-core";
import { BackButton } from "../common";
import "../lib/patternfly-4-overrides.scss";

export default function Delegation() {
    return (
        <>
            <BackButton />
            <Toolbar>
                <ToolbarContent>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <AddService />
                        </ToolbarItem>
                        <ToolbarItem>
                            <AnyProtocol />
                        </ToolbarItem>
                        <ToolbarItem>
                            <AnyService />
                        </ToolbarItem>
                        <ToolbarItem>
                            <Show />
                        </ToolbarItem>
                        <ToolbarItem>
                            <DeleteService />
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarContent>
            </Toolbar>
        </>
    );
}

document.addEventListener("DOMContentLoaded", () => {
    ReactDOM.render(<Delegation />, document.getElementById("delegation"));
});

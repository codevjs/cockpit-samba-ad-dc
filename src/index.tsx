/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2017 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import "core-js/stable";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Application } from './app';
import './globals.css';

document.addEventListener("DOMContentLoaded", function (): void {
    const container = document.getElementById('app');
    if (!container) {
        console.error('Could not find app container element');
        return;
    }

    const root = createRoot(container);
    root.render(React.createElement(Application, {}));
});

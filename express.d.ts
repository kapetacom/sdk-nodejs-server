/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */
/// <reference types="express" />

declare namespace Express {
    // Extend the express Response object to include renderPage and setRenderValue
    export interface Response {
        /**
         * Renders the application template with information about
         *
         *
         *
         * @param viewName The name of the view to render.
         * @param options The options to pass to the view.
         */
        renderPage(viewName: string, options?: any): void;

        setRenderValue(key: string, value: any): void;
        setRenderValue(obj: { [key: string]: any }): void;
    }
}

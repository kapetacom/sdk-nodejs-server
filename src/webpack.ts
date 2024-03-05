/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */

/// <reference path="../express.d.ts" />

import express, { Express, NextFunction, Request, Response } from 'express';
import FS from 'fs';
import * as Path from 'node:path';
import { asTemplates, TemplatesOverrides } from './templates';
import { isDevMode } from '../index';

const ensureArray = (value: string | string[]): string[] => {
    if (Array.isArray(value)) {
        return value;
    }
    return [value];
};

/**
 * Applies webpack handlers to the express app.
 * This is used to serve the frontend in dev mode and in prod mode.
 * In dev mode, the webpack dev middleware is used to serve the frontend.
 * In prod mode, the frontend is served from the dist folder.
 *
 * @param distFolder The absolute path to the dist folder where the build artifacts are located.
 * @param webpackConfig The webpack config used in dev mode.
 * @param app The express app to apply the handlers to.
 * @param templateOverrides Optional overrides for the templates used when rendering the HTML page.
 * @internal
 */
export const applyWebpackHandlers = (
    distFolder: string,
    webpackConfig: any,
    app: Express,
    templateOverrides?: TemplatesOverrides
) => {
    const templates = asTemplates(templateOverrides || {});

    const distPath: string = webpackConfig.output.publicPath || 'dist/';
    if (distPath && distPath.startsWith('/')) {
        throw new Error('The publicPath in the webpack config must be a relative path to work with fragments');
    }
    if (!distPath.endsWith('/')) {
        throw new Error(
            'The publicPath in the webpack config should end with a trailing slash to work properly w/ assets'
        );
    }

    // Set up the two different ways of getting the webpack assets, either devmode rendering,
    // or by reading the manifest in production mode
    if (isDevMode()) {
        /* eslint-disable @typescript-eslint/no-var-requires */
        console.log('Serving development version');
        const webpack = require('webpack');
        const webpackDevMiddleware = require('webpack-dev-middleware');
        const compiler = webpack(webpackConfig);

        app.use(
            webpackDevMiddleware(compiler, {
                serverSideRender: true,
                publicPath: distPath,
            })
        );

        app.use(require('webpack-hot-middleware')(compiler));

        // expose asset info on the request to be picked up by renderPage
        app.use((_req, res, next) => {
            const { devMiddleware } = res.locals.webpack;
            // Extract just the fields we need, since the webpack stats object is huge
            const { entrypoints } = devMiddleware.stats.toJson({
                all: false,
                entrypoints: true,
            }) as { entrypoints: { [key: string]: { assets: { name: string }[] } } };

            const assets = Object.keys(entrypoints).reduce((agg, pageName) => {
                const entryAssets = entrypoints[pageName].assets;

                agg[pageName] = {
                    js: entryAssets
                        .filter((chunk) => chunk.name.endsWith('.js'))
                        .map((chunk) => `${distPath}${chunk.name}`),
                    css: entryAssets
                        .filter((chunk) => chunk.name.endsWith('.css'))
                        .map((chunk) => `${distPath}${chunk.name}`),
                };
                return agg;
            }, {} as { [key: string]: { js: string[]; css: string[] } });

            res.locals.webpackAssets = assets;
            next();
        });

        /* eslint-enable */
    } else {
        console.log('Serving production version');
        if (!FS.existsSync(distFolder)) {
            console.error(
                'Distribution folder (%s) is missing - did you remember to build before running?',
                distFolder
            );
            process.exit(1);
        }
        const assetsDataFile = Path.join(distFolder, 'assets.json');
        if (!FS.existsSync(assetsDataFile)) {
            console.error(
                'Assets information (%s) is missing - did you remember to build before running?',
                assetsDataFile
            );
            process.exit(1);
        }

        // expose asset info on the request to be picked up by renderPage
        const assets = JSON.parse(FS.readFileSync(assetsDataFile, 'utf-8'));
        app.use((_req, res, next) => {
            res.locals.webpackAssets = assets;
            next();
        });
    }

    app.use((req, res, next) => {
        // Method to pass templateProps to the render method, without rendering immediately
        function setRenderValue(obj: { [key: string]: any }): void;
        function setRenderValue(key: string, value: any): void;
        function setRenderValue(key: string | { [key: string]: any }, value?: any): void {
            res.locals.templateProps = res.locals.templateProps || {};
            if (typeof key === 'object') {
                Object.entries(key).forEach(([keyX, valueX]) => res.setRenderValue(keyX, valueX));
            } else if (typeof key === 'string') {
                res.locals.templateProps[key] = value;
            }
        }
        res.setRenderValue = setRenderValue;

        // TODO: idea; viewName could be a kapeta page
        res.renderPage = (pageName: string, options: any) => {
            const baseUrl = (req.query._kap_basepath ? req.query._kap_basepath : '/').toString();

            const webpackAssets: { [key: string]: { js: string | string[]; css: string | string[] } } =
                res.locals.webpackAssets;

            if (!(pageName in res.locals.webpackAssets)) {
                // TODO: nicer error to point to the kapeta pages
                throw new Error('Invalid page render, page not found in asset map');
            }

            res.render(options?.viewName || pageName, {
                ...res.locals.templateProps,
                ...options,
                baseUrl,
                styles: ensureArray(webpackAssets[pageName].css)
                    .filter((path) => !path.endsWith('.hot-update.css'))
                    // Replace the auto/ prefix (webpack default) with the dist path
                    .map((path) => templates.renderStylesheet(req, res, path.replace(/^auto\//, `${distPath}`)))
                    .join('\n'),
                scripts: ensureArray(webpackAssets[pageName].js)
                    .filter((path) => !path.endsWith('.hot-update.js'))
                    // Replace the auto/ prefix (webpack default) with the dist path
                    .map((path) => templates.renderScript(req, res, path.replace(/^auto\//, `${distPath}`)))
                    .join('\n'),
            });
        };
        next();
    });

    app.use(
        `/${distPath}`,
        express.static(distFolder, {
            index: false,
            immutable: true,
            maxAge: 60 * 60 * 24 * 365 * 1000,
            fallthrough: false,
        })
    );
};

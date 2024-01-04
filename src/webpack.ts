/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */

import express, {Express} from "express";
import FS from "fs";
import * as Path from "node:path";
import {asTemplates, TemplatesOverrides} from "./templates";
import {isDevMode} from "../index";

function normalizeAssets(assets: any) {
    if (!Array.isArray(assets)) {
        return Object.values(assets);
    }

    return Array.isArray(assets) ? assets : [assets];
}

function allEntries(assetsByChunkName: any): string[] {
    const out: string[] = [];
    Object.values(assetsByChunkName).forEach((assets) => {
        const normalizedAssets = normalizeAssets(assets);
        if (Array.isArray(normalizedAssets)) {
            out.push(...normalizedAssets.filter((asset) => typeof asset === 'string'));
        }
    });
    return out;
}

/**
 * Applies webpack handlers to the express app.
 * This is used to serve the frontend in dev mode and in prod mode.
 * In dev mode, the webpack dev middleware is used to serve the frontend.
 * In prod mode, the frontend is served from the dist folder.
 *
 * @param distFolder The absolute path to the dist folder where the build artifacts are located.
 * @param devWebpackConfig The webpack config used in dev mode.
 * @param app The express app to apply the handlers to.
 * @param templateOverrides Optional overrides for the templates used when rendering the HTML page.
 */
export const applyWebpackHandlers = (distFolder: string, devWebpackConfig: any, app: Express, templateOverrides?:TemplatesOverrides) => {
    const templates = asTemplates(templateOverrides || {});

    if (isDevMode()) {
        /* eslint-disable */
        console.log("Serving development version");
        const webpack = require("webpack");
        const webpackDevMiddleware = require("webpack-dev-middleware");
        const compiler = webpack(devWebpackConfig);

        app.use(
            "/",
            webpackDevMiddleware(compiler, {
                publicPath: "",
                serverSideRender: true,
            })
        );

        app.use(require("webpack-hot-middleware")(compiler));

        app.get('/*', (req, res) => {
            const {devMiddleware} = res.locals.webpack;
            const outputFileSystem = devMiddleware.outputFileSystem;
            const jsonWebpackStats = devMiddleware.stats.toJson();
            const {assetsByChunkName, outputPath} = jsonWebpackStats;
            const baseUrl = (req.query._kap_basepath ? req.query._kap_basepath : '/').toString();

            res.send(templates.renderMain(req, {
                baseUrl,
                styles: templates.renderInlineStyle(req,
                    allEntries(assetsByChunkName)
                    .filter((path) => path.endsWith(".css") && !path.endsWith(".hot-update.css"))
                    .map((path) => outputFileSystem.readFileSync(Path.join(outputPath, path)))
                    .join("\n")
                ),
                scripts: allEntries(assetsByChunkName)
                    .filter((path) => path.endsWith(".js") && !path.endsWith(".hot-update.js"))
                    .map((path) => templates.renderScript(req, path))
                    .join("\n")
            }));
        });

        /* eslint-enable */
    } else {
        console.log("Serving production version");
        if (!FS.existsSync(distFolder)) {
            console.error(
                "Distribution folder (%s) is missing - did you remember to build before running?",
                distFolder
            );
            process.exit(1);
        }

        const assetsDataFile = Path.join(distFolder, 'assets.json');
        if (!FS.existsSync(assetsDataFile)) {
            console.error(
                "Assets information (%s) is missing - did you remember to build before running?",
                assetsDataFile
            );
            process.exit(1);
        }

        const assets = JSON.parse(FS.readFileSync(assetsDataFile).toString());
        app.use(express.static(distFolder));

        app.get('/*', (req, res) => {
            const baseUrl = (req.query._kap_basepath ? req.query._kap_basepath : '/').toString();

            res.send(templates.renderMain(req, {
                baseUrl,
                styles: allEntries(assets)
                    .filter((path) => path.endsWith(".css"))
                    .map((path) => templates.renderStylesheet(req,path))
                    .join("\n"),
                scripts: allEntries(assets)
                    .filter((path) => path.endsWith(".js") && !path.endsWith(".hot-update.js"))
                    .map((path) => templates.renderScript(req, path))
                    .join("\n")

            }));
        });
    }

}
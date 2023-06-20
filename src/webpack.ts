import express, {Express} from "express";
import FS from "fs";
import * as Path from "path";

function normalizeAssets(assets: any) {
    if (!Array.isArray(assets)) {
        return Object.values(assets);
    }

    return Array.isArray(assets) ? assets : [assets];
}

function allEntries(assetsByChunkName: any): any[] {
    const out: any[] = [];
    Object.values(assetsByChunkName).forEach(assets => {
        out.push(...normalizeAssets(assets));
    });
    return out;
}

const renderHTMLPage = ({baseUrl, head, body}: { baseUrl: any, head: string, body: string }) => {
    return `<html>
              <head>
                <meta charset="utf-8" />
                <base href="${baseUrl}" />
                ${head}
              </head>
              <body>
                ${body}
              </body>
            </html>`
}

export const applyWebpackHandlers = (distFolder: string, webpackConfig: any, app: Express) => {
    const devMode =
        !!(process.env.NODE_ENV &&
            process.env.NODE_ENV.toLowerCase() === "development");

    if (devMode) {
        /* eslint-disable */
        console.log("Serving development version");
        const webpack = require("webpack");
        const webpackDevMiddleware = require("webpack-dev-middleware");
        const compiler = webpack(webpackConfig);

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
            const baseUrl = req.query._kap_basepath ? req.query._kap_basepath : '/';

            res.send(renderHTMLPage({
                baseUrl,
                head: `<style>
                            ${allEntries(assetsByChunkName)
                    .filter((path) => path.endsWith(".css") && !path.endsWith(".hot-update.css"))
                    .map((path) => outputFileSystem.readFileSync(path.join(outputPath, path)))
                    .join("\n")}
                            </style>`,
                body: allEntries(assetsByChunkName)
                    .filter((path) => path.endsWith(".js") && !path.endsWith(".hot-update.js"))
                    .map((path) => `<script src="${path}"></script>`)
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
            const baseUrl = req.query._kap_basepath ? req.query._kap_basepath : '/';

            res.send(renderHTMLPage({
                baseUrl,
                head: allEntries(assets)
                    .filter((path) => path.endsWith(".css"))
                    .map((path) => `<link rel="stylesheet" href="${path}" >`)
                    .join("\n"),
                body: allEntries(assets)
                    .filter((path) => path.endsWith(".js") && !path.endsWith(".hot-update.js"))
                    .map((path) => `<script src="${path}"></script>`)
                    .join("\n")

            }));
        });
    }

}
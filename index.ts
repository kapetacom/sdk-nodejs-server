/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */

import { ConfigProvider } from '@kapeta/sdk-config';
import express, {Express, RequestHandler, Router} from 'express';
import { applyWebpackHandlers } from './src/webpack';
import {TemplatesOverrides} from "./src/templates";
const HEALTH_ENDPOINT = '/.kapeta/health';

export * from './src/helpers';
export * from './src/templates';

export type ServerOptions = {
    disableErrorHandling?: boolean;
    disableCatchAll?: boolean;
    disableHealthCheck?: boolean;
}

//We want dates as numbers
const JSONStringifyReplacer = function (this: any, key: string, value: any) {
    if (this[key] instanceof Date) {
        return this[key].getTime();
    }
    return value;
}

export type ServerPortType = 'rest'|'web'|'http';

export const isDevMode = () => {
    return !!(process.env.NODE_ENV &&
            process.env.NODE_ENV.toLowerCase() === "development");
}

export class Server {

    /**
     * Underlying express app
     */
    private readonly _express: Express;
    private readonly _options: ServerOptions;
    private readonly _config: ConfigProvider;
    private _serverPort?: number;
    private _serverHost?: string;

    constructor(config: ConfigProvider, options: ServerOptions = {}) {
        this._config = config;
        this._express = express();
        this._options = options;

        //Configure health endpoint as first route
        if (!this._options?.disableHealthCheck) {
            this.configureHealthCheck();
        }

        this._express.set('json replacer', JSONStringifyReplacer);

    }

    /**
     * Get access to the express app to make changes, add filters etc. directly
     */
    public express() {
        return this._express;
    }

    public config() {
        return this._config;
    }

    public use(...handlers: RequestHandler[]) {
        this._express.use(...handlers);
    }

    public configureAssets(distFolder: string, webpackConfig: any, templateOverrides?: TemplatesOverrides) {
        applyWebpackHandlers(distFolder, webpackConfig, this._express, templateOverrides);
    }

    /**
     * Starts server
     */
    public start(portType: ServerPortType) {
        console.log('Starting server for service: %s', this._config.getBlockReference());
        this._start(portType).catch((err) => {
            if (err.stack) {
                console.log(err.stack);
            } else {
                console.log('Failed to start: %s', err);
            }
        });
    }

    protected configureErrorHandler() {
        this._express.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            const errorBody = err.message ? { error: err.message } : { error: 'Unknown error' };
            if (err.statusCode) {
                res.status(err.statusCode).json(errorBody);
                return;
            }

            res.status(500).json(errorBody);
        });
    }

    protected configureCatchAll() {
        this._express.use((req, res) => {
            res.status(418).send({ error: 'Not available' });
        });
    }

    protected configureHealthCheck() {
        console.log('Configuring health check endpoint: %s', HEALTH_ENDPOINT);
        this._express.get(HEALTH_ENDPOINT, (req, res) => {
            res.status(200).send({ ok: true });
        });
    }

    protected async _start(portType: ServerPortType) {
        try {

            this._serverPort = parseInt(await this._config.getServerPort(portType));
            this._serverHost = await this._config.getServerHost();
        } catch (err: any) {
            if (err.message && err.message.indexOf('ECONN') > -1) {
                if (this._config) {
                    throw new Error(
                        'Failed while connecting to cluster server at ' +
                            this._config.getProviderId() +
                            ': ' +
                            err.message
                    );
                }

                throw new Error('Failed while connecting to cluster server: ' + err.message);
            }

            throw err;
        }

        if (!this._options?.disableErrorHandling) {
            this.configureErrorHandler();
        }

        if (!this._options?.disableCatchAll) {
            this.configureCatchAll();
        }

        console.log('Starting server on %s:%s', this._serverHost, this._serverPort);

        return new Promise((resolve) => {
            this._express.listen(this._serverPort!, this._serverHost!, () => {
                console.log('Server listening on %s:%s', this._serverHost, this._serverPort);
                resolve(null);
            });
        });
    }
}

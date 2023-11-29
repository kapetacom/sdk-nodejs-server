/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */

import { ConfigProvider } from '@kapeta/sdk-config';
import express, {Express, RequestHandler, Router} from 'express';
import { applyWebpackHandlers } from './src/webpack';
const HEALTH_ENDPOINT = '/.kapeta/health';

export * from './src/helpers';

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
            this._configureHealthCheck();
        }

        this._express.set('json replacer', JSONStringifyReplacer);

    }

    /**
     * Get access to the express app to make changes, add filters etc. directly
     *
     * @return {express}
     */
    public express() {
        return this._express;
    }

    public use(...handlers: RequestHandler[]) {
        this._express.use(...handlers);
    }

    public configureAssets(distFolder: string, webpackConfig: any) {
        applyWebpackHandlers(distFolder, webpackConfig, this._express);
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

    private _configureErrorHandler() {
        this._express.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            const errorBody = err.message ? { error: err.message } : { error: 'Unknown error' };
            if (err.statusCode) {
                res.status(err.statusCode).json(errorBody);
                return;
            }

            res.status(500).json(errorBody);
        });
    }

    private _configureCatchAll() {
        this._express.use((req, res) => {
            res.status(418).send({ error: 'Not available' });
        });
    }

    private _configureHealthCheck() {
        console.log('Configuring health check endpoint: %s', HEALTH_ENDPOINT);
        this._express.get(HEALTH_ENDPOINT, (req, res) => {
            res.status(200).send({ ok: true });
        });
    }

    private async _start(portType: ServerPortType) {
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
            this._configureErrorHandler();
        }

        if (!this._options?.disableCatchAll) {
            this._configureCatchAll();
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

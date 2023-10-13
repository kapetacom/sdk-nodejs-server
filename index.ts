import { ConfigProvider } from '@kapeta/sdk-config';
import express, { Express, Router } from 'express';
import Config from '@kapeta/sdk-config';
import { applyWebpackHandlers } from './src/webpack';

const HEALTH_ENDPOINT = '/__kapeta/health';

export interface Route {
    toExpressRoute(): Router;
}
export class Server {
    private readonly _serviceName: string;
    private readonly _blockPath: string;
    private readonly _express: Express;
    private _routes: Route[];
    private _config?: ConfigProvider;
    private _serverPort?: number;
    private _serverHost?: string;

    constructor(serviceName: string, blockPath: string) {
        /**
         * Name of this service
         */
        this._serviceName = serviceName;

        /**
         * Absolute path to the folder that contains the Block YML file for this service.
         */
        this._blockPath = blockPath;

        /**
         * Routes added to server
         * @type {Route[]}
         * @private
         */
        this._routes = [];

        /**
         * Underlying express app
         * @type {express}
         * @private
         */
        this._express = express();

        //Configure health endpoint as first route
        this._configureHealthCheck();
    }

    /**
     * Get access to the express app to make changes, add filters etc. directly
     *
     * @return {express}
     */
    express() {
        return this._express;
    }

    /**
     * Add Route to server
     * @param {Route} route
     */
    addRoute(route: Route) {
        this._routes.push(route);

        this._express.use(route.toExpressRoute());
    }

    configureAssets(distFolder: string, webpackConfig: any) {
        applyWebpackHandlers(distFolder, webpackConfig, this._express);
    }

    /**
     * Starts server
     *
     * @param [portType {string}] the type of port to listen on. Defaults to "rest"
     * @return {Promise<void>}
     */
    start(portType: string) {
        console.log('Starting server for service: %s', this._serviceName);
        this._configureCatchAll();
        this._start(portType).catch((err) => {
            if (err.stack) {
                console.log(err.stack);
            } else {
                console.log('Failed to start: %s', err);
            }
        });
    }

    _configureCatchAll() {
        this._express.use((req, res) => {
            res.status(400).send({ error: 'Not available' });
        });
    }

    _configureHealthCheck() {
        this._express.get(HEALTH_ENDPOINT, (req, res) => {
            res.status(200).send({ ok: true });
        });
    }

    /**
     *
     * @param [portType {string}] the type of port to listen on. Defaults to "rest"
     * @return {Promise<void>}
     * @private
     */
    async _start(portType: string) {
        try {
            this._config = await Config.init(this._blockPath, HEALTH_ENDPOINT, portType);
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

        console.log('Starting server on %s:%s', this._serverHost, this._serverPort);

        return new Promise((resolve) => {
            this._express.listen(this._serverPort!, this._serverHost!, () => {
                console.log('Server listening on %s:%s', this._serverHost, this._serverPort);
                resolve(null);
            });
        });
    }
}

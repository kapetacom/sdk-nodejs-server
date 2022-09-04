const express = require('express');
const Config = require('@blockware/sdk-config');

const HEALTH_ENDPOINT = '/__blockware/health';

class Server {

    constructor(serviceName, blockPath) {
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
         * Config provider
         * @type {ConfigProvider}
         * @private
         */
        this._config = null;

        /**
         * Underlying express app
         * @type {express}
         * @private
         */
        this._express = express();
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
    addRoute(route) {
        this._routes.push(route);

        this._express.use(route.toExpressRoute());
    }

    /**
     * Starts server
     *
     * @param [portType {string}] the type of port to listen on. Defaults to "rest"
     * @return {Promise<void>}
     */
    start(portType) {
        console.log('Starting server for service: %s', this._serviceName);
        this._start(portType).catch((err) => {
            if (err.stack) {
                console.log(err.stack);
            } else {
                console.log('Failed to start: %s', err);
            }
        })
    }

    _configureHealthCheck() {
        this._express.get(HEALTH_ENDPOINT, (req, res) => {
            res.status(200).send({ok:true});
        });
    }

    /**
     *
     * @param [portType {string}] the type of port to listen on. Defaults to "rest"
     * @return {Promise<void>}
     * @private
     */
    async _start(portType) {
        try {
            this._config = await Config.init(this._blockPath, HEALTH_ENDPOINT);
            this._serverPort = await this._config.getServerPort(portType);
        } catch(err) {

            if (err.message &&
                err.message.indexOf('ECONN') > -1) {
                if (this._config) {
                    throw new Error('Failed while connecting to cluster server at ' + this._config.getProviderId() + ': ' + err.message);
                }

                throw new Error('Failed while connecting to cluster server: ' + err.message);
            }

            throw err;
        }

        this._configureHealthCheck();

        console.log('Starting server on port %s', this._serverPort);

        return new Promise((resolve, reject) => {
            this._express.listen(this._serverPort, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                console.log('Server listening on port %s', this._serverPort);
                resolve();
            });
        });
    }
}


module.exports = Server;
const express = require('express');
const bodyParser = require('body-parser');
const Config = require('@blockware/sdk-config');


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
         * @type {RESTRoute[]}
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
     * Add REST endpoint to server
     * @param {RESTRoute} route
     */
    addRESTRoute(route) {
        this._routes.push(route);

        this._express.use(route.toExpressRoute());
    }

    /**
     * Starts server
     *
     * @return {Promise<void>}
     */
    start() {
        console.log('Starting server for service: %s', this._serviceName);
        this._start().catch((err) => {
            if (err.stack) {
                console.log(err.stack);
            } else {
                console.log('Failed to start: %s', err);
            }
        })
    }

    async _start() {
        try {
            this._config = await Config.init(this._blockPath);
            this._serverPort = await this._config.getServerPort();
        } catch(err) {
            if (err.message &&
                err.message.indexOf('ECONN') > -1) {
                throw new Error('Failed while connecting to cluster server at ' + this._config.getProviderId() + ': ' + err.message);
            }

            throw err;
        }

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
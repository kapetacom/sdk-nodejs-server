const express = require('express');
const Config = require('@blockware/sdk-config');

class Server {

    constructor(serviceName) {
        /**
         * Name of this service
         */
        this._serviceName = serviceName;

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
    async start() {
        this._config = await Config.init(this._serviceName);

        this._serverPort = await this._config.getServerPort();

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
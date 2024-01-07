# Kapeta NodeJS Server

This provides an HTTP server for Kapeta blocks.

It wraps the express server and provides plumbing for the blocks.

The Server class is implemented in [index.ts](index.ts).

## Features

### Frontend
Serves the frontend assets for the block when applicable.

Uses webpack to build the frontend assets and serves them from memory in dev mode - with hot reloading.
Will serve the assets from the dist folder in production mode.

See the ```Server.configureFrontend()``` method for details.

The webpack server is implemented in [src/webpack.ts](src/webpack.ts).

#### Templates
You can provide your templates to the method which controls the HTML served for the frontend.

To override the main HTML template, you can provide a function to the ```renderMain``` option.

The function will be called with the request, response and the template parameters.

Make sure to include all parameters in the template, otherwise the block will not work as expected.
```typescript
// The directory where the output of the build is stored
const DIST_DIR = Path.resolve(__dirname, "../dist");
const webpackConfig = require("../webpack.development.config");
server.configureFrontend(DIST_DIR, webpackConfig, {
    renderMain(req: Request, res: Response, params: MainTemplateParams): string {
        return `<!DOCTYPE html>
            <html lang="en-US">
              <head>
                <title>My site</title>
                <meta charset="utf-8" />
                <base href="${params.baseUrl}" />
                <link rel='shortcut icon' type="image/svg+xml" href='/assets/images/favicon.svg' />
                ${params.styles}
              </head>
              <body>
                ${params.scripts}
              </body>
            </html>`;
    }
});
```
The templates are implemented in [src/templates.ts](src/templates.ts).

### Healthcheck
The server provides a standard Kapeta healthcheck endpoint at `/.kapeta/health`.

You can disable this using the `disableHealthcheck` option.

You can also override the default health check by subclassing the Server and overriding the `configureHealthCheck` method.

### Catch-all Handler

Will add a catch-all route that will return a 418 for any request that does not match a route.

This makes it easier to determine if a request is not being handled by the server.

You can disable the catch-all route using the `disableCatchAll` option.

You can also override the default catch all by subclassing the Server and overriding the `configureCatchAll` method.

### Error handling

The server will catch any errors thrown by the routes and return a consistent response.
If the error contains a "statusCode" property it will be used as the response status code.

You can disable this using the `disableErrorHandling` option.

You can also override the default error handling by subclassing the Server and overriding the `configureErrorHandler` method.




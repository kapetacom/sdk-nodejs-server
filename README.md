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
The templates are managed via [express template engine](https://expressjs.com/en/guide/using-template-engines.html).
In short, express needs to know where the views live, and which renderer to use.

Make sure to include all parameters in the template, otherwise the block will not work as expected.

```typescript
// Set up webpack middleware and render methods
const DIST_DIR = Path.resolve(__dirname, "../dist");
const webpackConfig = require("../webpack.development.config");
server.configureFrontend(DIST_DIR, webpackConfig);

// Set up templating
const hbs = createHandlebars({
    extname: '.hbs',
    defaultLayout: false,
    helpers: {
        // Recommended helper to serialize values in handlebars
        toJSON: (obj: any) => JSON.stringify(obj),
    },
});
server.express().engine('handlebars', hbs.engine);
server.express().set('views', Path.resolve(__dirname, "../templates"));
server.express().set('view engine', 'handlebars');

server.get('/', async (req, res, next) => {
    // render the main template e.g. templates/main.hbs
    await server.renderPage('main');
});
```

Template parameters include:

- `baseURL` usually sets the HTML [base tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base) in the template
- `scripts` is a list of `<script>` tags to load the app JS bundle.
- `styles` is a list of `<style>` tags to load the app CSS bundle.

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




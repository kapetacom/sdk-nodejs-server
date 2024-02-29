## [4.0.2](https://github.com/kapetacom/sdk-nodejs-server/compare/v4.0.1...v4.0.2) (2024-02-29)


### Bug Fixes

* ensure relative paths for assets and guard against root dist path ([#17](https://github.com/kapetacom/sdk-nodejs-server/issues/17)) ([108bbee](https://github.com/kapetacom/sdk-nodejs-server/commit/108bbeef117c9ef1e4d0540046d5c22bcb4176fd))

## [4.0.1](https://github.com/kapetacom/sdk-nodejs-server/compare/v4.0.0...v4.0.1) (2024-02-23)


### Bug Fixes

* export express/webpack method types ([#16](https://github.com/kapetacom/sdk-nodejs-server/issues/16)) ([d7578f1](https://github.com/kapetacom/sdk-nodejs-server/commit/d7578f1c2b2ed2f7fdc8bf5c3163669fb3167755))

# [4.0.0](https://github.com/kapetacom/sdk-nodejs-server/compare/v3.2.0...v4.0.0) (2024-02-15)


### Features

* configureFrontend webpack pre-route middleware ([0d9d87e](https://github.com/kapetacom/sdk-nodejs-server/commit/0d9d87ef04074e10cdee590fd69844b4c51be992))


### BREAKING CHANGES

* Requires setup of express view engine and view directories, as well as
migrating to res.renderPage instead of fallthrough / catch-all rendering.

# [3.2.0](https://github.com/kapetacom/sdk-nodejs-server/compare/v3.1.2...v3.2.0) (2024-01-07)


### Features

* Add documentation and favicon to default template ([#14](https://github.com/kapetacom/sdk-nodejs-server/issues/14)) ([077088d](https://github.com/kapetacom/sdk-nodejs-server/commit/077088d42e2dbbb30898beafb1b9e0d0ca79b7bf))

## [3.1.2](https://github.com/kapetacom/sdk-nodejs-server/compare/v3.1.1...v3.1.2) (2024-01-06)


### Bug Fixes

* Add handler for favicon - causes slow response times ([#13](https://github.com/kapetacom/sdk-nodejs-server/issues/13)) ([07aff4e](https://github.com/kapetacom/sdk-nodejs-server/commit/07aff4e52562e050695739adb233d65ae709ded6))

## [3.1.1](https://github.com/kapetacom/sdk-nodejs-server/compare/v3.1.0...v3.1.1) (2024-01-05)


### Bug Fixes

* Include status code in response ([9604b88](https://github.com/kapetacom/sdk-nodejs-server/commit/9604b88411004314b7cd7470394d676b2d719b86))

# [3.1.0](https://github.com/kapetacom/sdk-nodejs-server/compare/v3.0.0...v3.1.0) (2024-01-05)


### Features

* Also adds response to templates ([c6bb5c0](https://github.com/kapetacom/sdk-nodejs-server/commit/c6bb5c079c2c67bf867ee5313b626f4654b84763))

# [3.0.0](https://github.com/kapetacom/sdk-nodejs-server/compare/v2.1.2...v3.0.0) (2024-01-04)


### Features

* Include requests in templates ([#12](https://github.com/kapetacom/sdk-nodejs-server/issues/12)) ([497f58c](https://github.com/kapetacom/sdk-nodejs-server/commit/497f58cafaed3cbcb31f808198776f69b08885f5))


### BREAKING CHANGES

* Breaks compatibility with previous render methods

## [2.1.2](https://github.com/kapetacom/sdk-nodejs-server/compare/v2.1.1...v2.1.2) (2024-01-04)


### Bug Fixes

* Make it possible to overwrite methods in Server ([#11](https://github.com/kapetacom/sdk-nodejs-server/issues/11)) ([09e194f](https://github.com/kapetacom/sdk-nodejs-server/commit/09e194f4486941db29ebf4c9d3462b15e6e9b0f6))

## [2.1.1](https://github.com/kapetacom/sdk-nodejs-server/compare/v2.1.0...v2.1.1) (2023-12-29)


### Bug Fixes

* Make baseUrl string ([215cf96](https://github.com/kapetacom/sdk-nodejs-server/commit/215cf96005a58e3a105e265bdd4c24c917acde8b))
* Typo in template types ([bf614b9](https://github.com/kapetacom/sdk-nodejs-server/commit/bf614b9fe84385d2a490d990a3f388eb96aa6a8b))

# [2.1.0](https://github.com/kapetacom/sdk-nodejs-server/compare/v2.0.2...v2.1.0) (2023-12-29)


### Features

* Add template override argument to configureAssets ([#10](https://github.com/kapetacom/sdk-nodejs-server/issues/10)) ([df5751d](https://github.com/kapetacom/sdk-nodejs-server/commit/df5751d1c78679e8f5353bb0db937b25451d71b3))

## [2.0.2](https://github.com/kapetacom/sdk-nodejs-server/compare/v2.0.1...v2.0.2) (2023-12-15)


### Bug Fixes

* Ensure allEntries returns string[] ([920ee33](https://github.com/kapetacom/sdk-nodejs-server/commit/920ee3387fe4c3b9aceb9306213123e7320ce511))
* Fix file path in webpack.ts ([0e7972f](https://github.com/kapetacom/sdk-nodejs-server/commit/0e7972fa5e7e0b170ed0b40ba64fc52a542244c3))

## [2.0.1](https://github.com/kapetacom/sdk-nodejs-server/compare/v2.0.0...v2.0.1) (2023-12-13)


### Bug Fixes

* Adjust dependencies to match v2 ([ec453e2](https://github.com/kapetacom/sdk-nodejs-server/commit/ec453e2530e49384dbaa6a6c8df687671d6ec79e))

# [2.0.0](https://github.com/kapetacom/sdk-nodejs-server/compare/v1.3.0...v2.0.0) (2023-12-12)


### Features

* Simplify constructor and api ([#8](https://github.com/kapetacom/sdk-nodejs-server/issues/8)) ([8bc7c72](https://github.com/kapetacom/sdk-nodejs-server/commit/8bc7c72a315fea74200663feb93525e626e678e0))


### BREAKING CHANGES

* Refactored to be used like plain express

# [1.3.0](https://github.com/kapetacom/sdk-nodejs-server/compare/v1.2.0...v1.3.0) (2023-10-13)


### Features

* Remove compression middleware ([8ae7f42](https://github.com/kapetacom/sdk-nodejs-server/commit/8ae7f42e77a3e930026cde81e67b1662591c2545))

# [1.2.0](https://github.com/kapetacom/sdk-nodejs-server/compare/v1.1.0...v1.2.0) (2023-09-12)


### Features

* Add compression ([958f484](https://github.com/kapetacom/sdk-nodejs-server/commit/958f48405915a9bf711765a9503fe6dcf09101cb))

# [1.1.0](https://github.com/kapetacom/sdk-nodejs-server/compare/v1.0.2...v1.1.0) (2023-06-20)


### Features

* Adds dynamic server side rendering of html page ([#3](https://github.com/kapetacom/sdk-nodejs-server/issues/3)) ([47fb4ee](https://github.com/kapetacom/sdk-nodejs-server/commit/47fb4ee5eb22c7d8a087d3a011455eba3d26639e))

## [1.0.2](https://github.com/kapetacom/sdk-nodejs-server/compare/v1.0.1...v1.0.2) (2023-06-11)


### Bug Fixes

* Default to commonjs ([ffd9cb7](https://github.com/kapetacom/sdk-nodejs-server/commit/ffd9cb75be94e980f2a86ec39de36036aaa809db))

## [1.0.1](https://github.com/kapetacom/sdk-nodejs-server/compare/v1.0.0...v1.0.1) (2023-06-09)


### Bug Fixes

* Support mixed modules ([1a56d5f](https://github.com/kapetacom/sdk-nodejs-server/commit/1a56d5fd09945fb53ebb4c5384cf7280ea56305f))

# 1.0.0 (2023-06-09)


### Bug Fixes

* Configure health check before all other routes ([52e596a](https://github.com/kapetacom/sdk-nodejs-server/commit/52e596ae123071f423fc27e2815070e8b1dc5d27))
* Repository path ([2151359](https://github.com/kapetacom/sdk-nodejs-server/commit/215135918e40cb543b9e094cfe7ba775fccd756a))


### Features

* Rewrote to Typescript ([#2](https://github.com/kapetacom/sdk-nodejs-server/issues/2)) ([9b812bd](https://github.com/kapetacom/sdk-nodejs-server/commit/9b812bdfb6ab80f905fe4f3b6bd8172f46ba6f32))

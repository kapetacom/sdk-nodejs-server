import { NextFunction, Request, RequestHandler, Response } from 'express';
import * as core from 'express-serve-static-core';

export const createDelayedRequestHandler = <
    P = core.ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = core.Query,
    Locals extends Record<string, any> = Record<string, any>
>(
    delayedHandler: Promise<RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>>
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> => {
    return (
        req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
        res: Response<ResBody, Locals>,
        next: NextFunction
    ) => {
        delayedHandler
            .then((h) => {
                h(req, res, next);
            })
            .catch((err) => {
                next(err);
            });
    };
};

export const asyncHandler = <T extends RequestHandler<any, any, any, any, any>>(handler: T): T => {
    const wrapper = (req: Request, res: Response, next: NextFunction) => {
        const promise = handler(req, res, next) as unknown as Promise<void>;
        if (promise && promise.catch) {
            promise.catch((err) => {
                next(err);
            });
        }
    };

    return wrapper as T;
};

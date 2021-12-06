import 'reflect-metadata';
import Boom from '@hapi/boom';
import { Request, Response, NextFunction } from 'express';
import { ExpressMiddlewareInterface } from 'routing-controllers';

export class Authenticate implements ExpressMiddlewareInterface {
    async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
        let apiKey: string | null = null;

        const authHeader = (req.headers.authorization || '').split(' ');
        if (authHeader.length > 0) {
            apiKey = authHeader[authHeader.length - 1];
        } else {
            apiKey = req.body.apikey || req.query.apikey;
        }
        if (!apiKey) {
            return next(Boom.unauthorized('API Key is required'));
        }

        try {
            // Perform authentication with database service
            return next();
        } catch (err) {
            return next(Boom.unauthorized('This API Key is unauthorized'));
        }
    }
}

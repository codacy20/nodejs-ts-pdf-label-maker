import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../constants/types.js';
import { ILogger } from './Logger.js';

@injectable()
export class RequestLogger {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger
    ) { }

    public middleware() {
        return (req: Request, res: Response, next: NextFunction) => {
            const start = Date.now();
            const requestId = this.generateRequestId();

            this.logger.info(`Incoming request ${req.method} ${req.originalUrl}`, {
                requestId,
                method: req.method,
                url: req.originalUrl,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.on('finish', () => {
                const duration = Date.now() - start;

                this.logger.info(`Response sent ${req.method} ${req.originalUrl}`, {
                    requestId,
                    method: req.method,
                    url: req.originalUrl,
                    statusCode: res.statusCode,
                    duration: `${duration}ms`
                });
            });

            next();
        };
    }

    private generateRequestId(): string {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
} 
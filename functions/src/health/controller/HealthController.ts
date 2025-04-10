import { controller, httpGet } from 'inversify-express-utils';
import { Request, Response } from 'express';
import os from 'os';

@controller('/health')
export class HealthController {
    @httpGet('/')
    async getHealth(_req: Request, res: Response): Promise<void> {
        const healthData = {
            status: 'UP',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            uptime: process.uptime(),
            memory: {
                rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
                heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
                heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
            },
            system: {
                totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
                freeMemory: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
                cpus: os.cpus().length,
                loadAvg: os.loadavg()
            }
        };

        res.json(healthData);
    }

    @httpGet('/liveness')
    async getLiveness(_req: Request, res: Response): Promise<void> {
        res.json({ status: 'UP' });
    }

    @httpGet('/readiness')
    async getReadiness(_req: Request, res: Response): Promise<void> {
        res.json({ status: 'READY' });
    }
} 
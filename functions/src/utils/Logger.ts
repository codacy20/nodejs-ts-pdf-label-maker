import { injectable } from 'inversify';

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR'
}

export interface ILogger {
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}

@injectable()
export class Logger implements ILogger {
    private logToConsole(level: LogLevel, message: string, meta?: any): void {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} [${level}] ${message}`;
        
        switch (level) {
            case LogLevel.DEBUG:
                console.debug(logMessage, meta ? JSON.stringify(meta) : '');
                break;
            case LogLevel.INFO:
                console.info(logMessage, meta ? JSON.stringify(meta) : '');
                break;
            case LogLevel.WARN:
                console.warn(logMessage, meta ? JSON.stringify(meta) : '');
                break;
            case LogLevel.ERROR:
                console.error(logMessage, meta ? JSON.stringify(meta) : '');
                break;
        }
    }

    debug(message: string, meta?: any): void {
        this.logToConsole(LogLevel.DEBUG, message, meta);
    }

    info(message: string, meta?: any): void {
        this.logToConsole(LogLevel.INFO, message, meta);
    }

    warn(message: string, meta?: any): void {
        this.logToConsole(LogLevel.WARN, message, meta);
    }

    error(message: string, meta?: any): void {
        this.logToConsole(LogLevel.ERROR, message, meta);
    }
} 
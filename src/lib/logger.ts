/**
 * Logger Utility
 * Centralized logging with namespaces
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

class Logger {
  private namespace: string;
  private isDevelopment: boolean;

  constructor(namespace = 'App') {
    this.namespace = namespace;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  extend(namespace: string): Logger {
    return new Logger(`${this.namespace}:${namespace}`);
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${this.namespace}]`;

    if (this.isDevelopment || level === 'ERROR') {
      switch (level) {
        case 'DEBUG':
          console.debug(prefix, message, ...args);
          break;
        case 'INFO':
          console.log(prefix, message, ...args);
          break;
        case 'WARN':
          console.warn(prefix, message, ...args);
          break;
        case 'ERROR':
          console.error(prefix, message, ...args);
          break;
      }
    }
  }

  debug(message: string, ...args: any[]) {
    this.log('DEBUG', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('INFO', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('WARN', message, ...args);
  }

  error(message: string, error?: any, ...args: any[]) {
    this.log('ERROR', message, error, ...args);
  }
}

export const logger = new Logger();
export const createLogger = (namespace: string) => logger.extend(namespace);

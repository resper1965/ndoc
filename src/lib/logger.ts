/**
 * Logger Estruturado
 * 
 * Sistema de logging centralizado para substituir console.log
 * Suporta diferentes níveis e formatação estruturada
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sanitized: LogContext = {};
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];

    for (const [key, value] of Object.entries(context)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else if (value instanceof Error) {
        sanitized[key] = {
          message: value.message,
          stack: this.isDevelopment ? value.stack : undefined,
          name: value.name,
        };
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    let sanitizedContext = this.sanitizeContext(context) || {};
    
    if (error instanceof Error) {
      sanitizedContext = {
        ...sanitizedContext,
        error: {
          message: error.message,
          stack: this.isDevelopment ? error.stack : undefined,
          name: error.name,
        },
      };
    }

    const formatted = this.formatMessage('error', message, sanitizedContext);
    
    if (this.isDevelopment) {
      console.error(formatted);
    } else {
      // Em produção, enviar para serviço de logging (Sentry, LogRocket, etc.)
      // Por enquanto, apenas console.error sanitizado
      console.error(formatted);
    }
  }

  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('warn', message, this.sanitizeContext(context));
    
    if (this.isDevelopment) {
      console.warn(formatted);
    } else {
      console.warn(formatted);
    }
  }

  info(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('info', message, this.sanitizeContext(context));
    
    if (this.isDevelopment) {
      console.info(formatted);
    }
    // Em produção, apenas logar se necessário
  }

  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    
    const formatted = this.formatMessage('debug', message, this.sanitizeContext(context));
    console.debug(formatted);
  }
}

export const logger = new Logger();


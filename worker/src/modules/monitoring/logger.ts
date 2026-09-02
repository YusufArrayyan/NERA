/**
 * Logger
 * Structured logging with levels and sinks
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context: Record<string, any>;
  stack?: string;
  source?: string;
}

export interface LogSink {
  write(entry: LogEntry): Promise<void> | void;
  flush?(): Promise<void>;
}

export interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'text';
  sinks: LogSink[];
}

/**
 * Logger
 */
export class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private bufferSize: number = 100;
  private flushInterval: number = 5000; // ms
  private intervalId: NodeJS.Timer | null = null;

  private static levelOrder: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
  };

  constructor(config: LoggerConfig) {
    this.config = config;

    // Start periodic flush
    this.intervalId = setInterval(() => this.flush(), this.flushInterval);
  }

  /**
   * Log message
   */
  private log(level: LogLevel, message: string, context: Record<string, any> = {}, stack?: string): void {
    // Check log level
    if (Logger.levelOrder[level] < Logger.levelOrder[this.config.level]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
      stack,
      source: this.getCallerInfo(),
    };

    // Add to buffer
    this.buffer.push(entry);

    // Flush if buffer is full
    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  /**
   * Debug log
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  /**
   * Info log
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Warn log
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Error log
   */
  error(message: string, error?: Error | Record<string, any>, context?: Record<string, any>): void {
    let errorContext = context || {};

    if (error instanceof Error) {
      errorContext.error = error.message;
      this.log('error', message, errorContext, error.stack);
    } else if (error) {
      errorContext = { ...error, ...context };
      this.log('error', message, errorContext);
    } else {
      this.log('error', message, errorContext);
    }
  }

  /**
   * Fatal log
   */
  fatal(message: string, error?: Error | Record<string, any>, context?: Record<string, any>): void {
    this.error(message, error, context);
    this.flush();

    // In test environments, don't actually exit
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }

  /**
   * Flush buffer
   */
  flush(): void {
    if (this.buffer.length === 0) return;

    const entries = [...this.buffer];
    this.buffer = [];

    for (const entry of entries) {
      for (const sink of this.config.sinks) {
        sink.write(entry);
      }
    }
  }

  /**
   * Get caller info
   */
  private getCallerInfo(): string {
    const stack = new Error().stack || '';
    const lines = stack.split('\n');

    // Skip first 3 lines (Error, this method, calling method)
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('at ')) {
        return line.trim();
      }
    }

    return 'unknown';
  }

  /**
   * Shutdown
   */
  async shutdown(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.flush();

    // Flush all sinks
    for (const sink of this.config.sinks) {
      if (sink.flush) {
        await sink.flush();
      }
    }
  }

  /**
   * Create child logger with additional context
   */
  createChild(context: Record<string, any>): ChildLogger {
    return new ChildLogger(this, context);
  }
}

/**
 * Child Logger
 */
export class ChildLogger {
  constructor(private parent: Logger, private parentContext: Record<string, any>) {}

  debug(message: string, context?: Record<string, any>): void {
    this.parent.debug(message, { ...this.parentContext, ...context });
  }

  info(message: string, context?: Record<string, any>): void {
    this.parent.info(message, { ...this.parentContext, ...context });
  }

  warn(message: string, context?: Record<string, any>): void {
    this.parent.warn(message, { ...this.parentContext, ...context });
  }

  error(message: string, error?: Error | Record<string, any>, context?: Record<string, any>): void {
    this.parent.error(message, error, { ...this.parentContext, ...context });
  }

  fatal(message: string, error?: Error | Record<string, any>, context?: Record<string, any>): void {
    this.parent.fatal(message, error, { ...this.parentContext, ...context });
  }

  createChild(context: Record<string, any>): ChildLogger {
    return new ChildLogger(this.parent, { ...this.parentContext, ...context });
  }
}

/**
 * Console Log Sink
 */
export class ConsoleSink implements LogSink {
  write(entry: LogEntry): void {
    const logFn = entry.level === 'error' || entry.level === 'fatal' ? console.error : console.log;

    const timestamp = new Date(entry.timestamp).toISOString();
    const message = `[${timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;

    logFn(message);

    if (Object.keys(entry.context).length > 0) {
      logFn('Context:', entry.context);
    }

    if (entry.stack) {
      logFn('Stack:', entry.stack);
    }
  }
}

/**
 * Memory Log Sink
 */
export class MemorySink implements LogSink {
  private entries: LogEntry[] = [];
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  write(entry: LogEntry): void {
    this.entries.push(entry);

    if (this.entries.length > this.maxSize) {
      this.entries = this.entries.slice(-this.maxSize);
    }
  }

  getEntries(limitOrLevel?: number | LogLevel, limit?: number): LogEntry[] {
    if (typeof limitOrLevel === 'string') {
      // Called with level
      const level = limitOrLevel;
      const actualLimit = limit || 100;
      return this.entries
        .filter(e => e.level === level)
        .slice(-actualLimit);
    } else {
      // Called with limit only
      const actualLimit = limitOrLevel || 100;
      return this.entries.slice(-actualLimit);
    }
  }

  clear(): void {
    this.entries = [];
  }
}

/**
 * Create logger
 */
export function createLogger(config: Partial<LoggerConfig> = {}): Logger {
  const finalConfig: LoggerConfig = {
    level: (config.level as LogLevel) || 'info',
    format: config.format || 'json',
    sinks: config.sinks || [new ConsoleSink()],
  };

  return new Logger(finalConfig);
}

/**
 * Create logger with memory sink
 */
export function createLoggerWithMemory(level: LogLevel = 'info', maxSize: number = 1000): {
  logger: Logger;
  sink: MemorySink;
} {
  const sink = new MemorySink(maxSize);
  const logger = new Logger({
    level,
    format: 'json',
    sinks: [new ConsoleSink(), sink],
  });

  return { logger, sink };
}

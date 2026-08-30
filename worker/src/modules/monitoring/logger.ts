/**
 * Logger Module
 * Structured logging with levels, filtering, and sampling
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggerConfig {
  minLevel: LogLevel;
  maxLogs: number; // Max in-memory logs
  enableConsole: boolean;
  enableFile: boolean;
  sampleRate: number; // 0-1, for sampling verbose logs
}

export class Logger {
  private logs: LogEntry[] = [];
  private config: LoggerConfig;
  private levelPriority = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
  };

  constructor(private component: string, config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: 'info',
      maxLogs: 5000,
      enableConsole: true,
      enableFile: false,
      sampleRate: 1,
      ...config,
    };
  }

  /**
   * Log at debug level
   */
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  /**
   * Log at info level
   */
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  /**
   * Log at warn level
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  /**
   * Log at error level
   */
  error(message: string, error?: Error | any): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: 'error',
      component: this.component,
      message,
      error: error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };

    if (typeof error === 'object' && error !== null) {
      entry.data = error;
    }

    this.addLog(entry);
  }

  /**
   * Log at fatal level
   */
  fatal(message: string, error?: Error): void {
    this.log('fatal', message, error);
  }

  /**
   * Get all logs
   */
  getLogs(filter?: { level?: LogLevel; component?: string; since?: number }): LogEntry[] {
    let result = [...this.logs];

    if (filter?.level) {
      result = result.filter(log => log.level === filter.level);
    }

    if (filter?.component) {
      result = result.filter(log => log.component.includes(filter.component));
    }

    if (filter?.since) {
      result = result.filter(log => log.timestamp >= filter.since);
    }

    return result;
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Get log statistics
   */
  getStatistics(): Record<LogLevel, number> {
    return {
      debug: this.logs.filter(l => l.level === 'debug').length,
      info: this.logs.filter(l => l.level === 'info').length,
      warn: this.logs.filter(l => l.level === 'warn').length,
      error: this.logs.filter(l => l.level === 'error').length,
      fatal: this.logs.filter(l => l.level === 'fatal').length,
    };
  }

  /**
   * Export logs as JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Export logs as CSV
   */
  exportCSV(): string {
    const header = ['timestamp', 'level', 'component', 'message', 'data'];
    const rows = this.logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.level,
      log.component,
      log.message,
      JSON.stringify(log.data || {}),
    ]);

    return [header, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  // ============ PRIVATE HELPER METHODS ============

  private log(level: LogLevel, message: string, data?: any): void {
    // Check if log level meets threshold
    if (this.levelPriority[level] < this.levelPriority[this.config.minLevel]) {
      return;
    }

    // Apply sampling for debug/info logs
    if ((level === 'debug' || level === 'info') && Math.random() > this.config.sampleRate) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      component: this.component,
      message,
      data,
    };

    this.addLog(entry);
  }

  private addLog(entry: LogEntry): void {
    // Add to in-memory log
    this.logs.push(entry);

    // Keep max logs
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(-this.config.maxLogs);
    }

    // Output to console if enabled
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${entry.component}] ${entry.level.toUpperCase()}:`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.data);
        break;
      case 'info':
        console.info(message, entry.data);
        break;
      case 'warn':
        console.warn(message, entry.data);
        break;
      case 'error':
        console.error(message, entry.error ?? entry.data);
        break;
      case 'fatal':
        console.error(message, entry.data);
        break;
    }
  }
}

/**
 * Global logger registry
 */
export class LoggerRegistry {
  private loggers: Map<string, Logger> = new Map();
  private globalConfig: Partial<LoggerConfig> = {};

  /**
   * Get or create logger for component
   */
  getLogger(component: string): Logger {
    if (!this.loggers.has(component)) {
      this.loggers.set(component, new Logger(component, this.globalConfig));
    }
    return this.loggers.get(component)!;
  }

  /**
   * Set global logger configuration
   */
  setConfig(config: Partial<LoggerConfig>): void {
    this.globalConfig = { ...this.globalConfig, ...config };

    // Apply to existing loggers
    for (const logger of this.loggers.values()) {
      Object.assign(logger['config'], config);
    }
  }

  /**
   * Get all logs from all loggers
   */
  getAllLogs(): LogEntry[] {
    const all: LogEntry[] = [];
    for (const logger of this.loggers.values()) {
      all.push(...logger.getLogs());
    }
    return all.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get logs by component
   */
  getLogsByComponent(component: string): LogEntry[] {
    const logger = this.loggers.get(component);
    return logger ? logger.getLogs() : [];
  }

  /**
   * Get combined statistics
   */
  getStatistics(): Record<string, any> {
    const stats: Record<string, any> = {};
    for (const [component, logger] of this.loggers) {
      stats[component] = logger.getStatistics();
    }
    return stats;
  }

  /**
   * Clear all logs
   */
  clearAll(): void {
    for (const logger of this.loggers.values()) {
      logger.clear();
    }
  }

  /**
   * Export all logs as JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.getAllLogs(), null, 2);
  }
}

/**
 * Global logger registry instance
 */
export const loggerRegistry = new LoggerRegistry();

/**
 * Factory function to get logger
 */
export function getLogger(component: string): Logger {
  return loggerRegistry.getLogger(component);
}

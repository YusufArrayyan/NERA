/**
 * Data Integrity Checker
 * Validates data consistency across the system
 */

export interface IntegrityRule {
  id: string;
  name: string;
  description: string;
  check: (data: Record<string, any>) => boolean | Promise<boolean>;
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
}

export interface IntegrityCheckResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

export interface DataIntegrityReport {
  timestamp: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warnings: number;
  criticalIssues: number;
  results: IntegrityCheckResult[];
  isHealthy: boolean;
}

/**
 * Data Integrity Checker
 */
export class DataIntegrityChecker {
  private rules: Map<string, IntegrityRule> = new Map();
  private checkResults: IntegrityCheckResult[] = [];

  /**
   * Register integrity rule
   */
  registerRule(rule: IntegrityRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Register multiple rules
   */
  registerRules(rules: IntegrityRule[]): void {
    for (const rule of rules) {
      this.registerRule(rule);
    }
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId: string): IntegrityRule | null {
    return this.rules.get(ruleId) || null;
  }

  /**
   * Enable rule
   */
  enableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    rule.enabled = true;
    return true;
  }

  /**
   * Disable rule
   */
  disableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    rule.enabled = false;
    return true;
  }

  /**
   * Run all checks
   */
  async runAllChecks(data: Record<string, any>): Promise<DataIntegrityReport> {
    this.checkResults = [];
    const startTime = Date.now();

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      try {
        const passed = await rule.check(data);

        const result: IntegrityCheckResult = {
          ruleId: rule.id,
          ruleName: rule.name,
          passed,
          severity: rule.severity,
          message: passed ? `✓ ${rule.name}` : `✗ ${rule.name}`,
          timestamp: Date.now(),
        };

        this.checkResults.push(result);
      } catch (error) {
        const result: IntegrityCheckResult = {
          ruleId: rule.id,
          ruleName: rule.name,
          passed: false,
          severity: rule.severity,
          message: `Error: ${(error as Error).message}`,
          timestamp: Date.now(),
        };

        this.checkResults.push(result);
      }
    }

    return this.generateReport();
  }

  /**
   * Run specific check
   */
  async runCheck(ruleId: string, data: Record<string, any>): Promise<IntegrityCheckResult | null> {
    const rule = this.rules.get(ruleId);
    if (!rule || !rule.enabled) return null;

    try {
      const passed = await rule.check(data);

      const result: IntegrityCheckResult = {
        ruleId: rule.id,
        ruleName: rule.name,
        passed,
        severity: rule.severity,
        message: passed ? `✓ ${rule.name}` : `✗ ${rule.name}`,
        timestamp: Date.now(),
      };

      this.checkResults.push(result);
      return result;
    } catch (error) {
      const result: IntegrityCheckResult = {
        ruleId: rule.id,
        ruleName: rule.name,
        passed: false,
        severity: rule.severity,
        message: `Error: ${(error as Error).message}`,
        timestamp: Date.now(),
      };

      this.checkResults.push(result);
      return result;
    }
  }

  /**
   * Generate integrity report
   */
  private generateReport(): DataIntegrityReport {
    const passedChecks = this.checkResults.filter(r => r.passed).length;
    const failedChecks = this.checkResults.filter(r => !r.passed).length;
    const warnings = this.checkResults.filter(r => !r.passed && r.severity === 'warning').length;
    const criticalIssues = this.checkResults.filter(r => !r.passed && r.severity === 'critical').length;

    return {
      timestamp: Date.now(),
      totalChecks: this.checkResults.length,
      passedChecks,
      failedChecks,
      warnings,
      criticalIssues,
      results: [...this.checkResults],
      isHealthy: criticalIssues === 0 && failedChecks === 0,
    };
  }

  /**
   * Get last report
   */
  getLastReport(): DataIntegrityReport {
    return this.generateReport();
  }

  /**
   * Get check results
   */
  getResults(): IntegrityCheckResult[] {
    return [...this.checkResults];
  }

  /**
   * Get passed checks
   */
  getPassedChecks(): IntegrityCheckResult[] {
    return this.checkResults.filter(r => r.passed);
  }

  /**
   * Get failed checks
   */
  getFailedChecks(): IntegrityCheckResult[] {
    return this.checkResults.filter(r => !r.passed);
  }

  /**
   * Get critical issues
   */
  getCriticalIssues(): IntegrityCheckResult[] {
    return this.checkResults.filter(r => !r.passed && r.severity === 'critical');
  }

  /**
   * Check system health
   */
  isSystemHealthy(): boolean {
    const report = this.generateReport();
    return report.isHealthy;
  }

  /**
   * Clear results
   */
  clearResults(): void {
    this.checkResults = [];
  }
}

/**
 * Standard Integrity Rules
 */
export const StandardIntegrityRules = {
  /**
   * Schema validation rule
   */
  schemaValidation: (requiredFields: string[]): IntegrityRule => ({
    id: 'schema_validation',
    name: 'Schema Validation',
    description: `Validates that all required fields are present: ${requiredFields.join(', ')}`,
    check: (data: Record<string, any>) => {
      for (const field of requiredFields) {
        if (!(field in data)) {
          return false;
        }
      }
      return true;
    },
    severity: 'critical',
    enabled: true,
  }),

  /**
   * Data type validation rule
   */
  typeValidation: (typeMap: Record<string, string>): IntegrityRule => ({
    id: 'type_validation',
    name: 'Type Validation',
    description: 'Validates data types of fields',
    check: (data: Record<string, any>) => {
      for (const [field, expectedType] of Object.entries(typeMap)) {
        if (field in data) {
          const actualType = typeof data[field];
          if (actualType !== expectedType) {
            return false;
          }
        }
      }
      return true;
    },
    severity: 'critical',
    enabled: true,
  }),

  /**
   * Range validation rule
   */
  rangeValidation: (field: string, min: number, max: number): IntegrityRule => ({
    id: `range_validation_${field}`,
    name: `Range Validation (${field})`,
    description: `Validates ${field} is between ${min} and ${max}`,
    check: (data: Record<string, any>) => {
      if (field in data) {
        const value = data[field];
        return typeof value === 'number' && value >= min && value <= max;
      }
      return true;
    },
    severity: 'warning',
    enabled: true,
  }),

  /**
   * Uniqueness validation rule
   */
  uniquenessValidation: (field: string, dataset: any[]): IntegrityRule => ({
    id: `uniqueness_validation_${field}`,
    name: `Uniqueness Validation (${field})`,
    description: `Validates ${field} is unique in dataset`,
    check: (data: Record<string, any>) => {
      if (field in data) {
        const count = dataset.filter(item => item[field] === data[field]).length;
        return count <= 1;
      }
      return true;
    },
    severity: 'critical',
    enabled: true,
  }),

  /**
   * Consistency rule
   */
  consistency: (checker: (data: Record<string, any>) => boolean): IntegrityRule => ({
    id: 'consistency_check',
    name: 'Consistency Check',
    description: 'Custom consistency validation',
    check: checker,
    severity: 'critical',
    enabled: true,
  }),

  /**
   * Null check rule
   */
  nullCheck: (field: string): IntegrityRule => ({
    id: `null_check_${field}`,
    name: `Null Check (${field})`,
    description: `Validates ${field} is not null`,
    check: (data: Record<string, any>) => {
      return field in data && data[field] !== null;
    },
    severity: 'warning',
    enabled: true,
  }),
};

/**
 * Create data integrity checker
 */
export function createDataIntegrityChecker(): DataIntegrityChecker {
  return new DataIntegrityChecker();
}

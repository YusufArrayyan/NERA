/**
 * Compliance Manager
 * GDPR, HIPAA, and regulatory compliance
 */

export type ComplianceStandard = 'GDPR' | 'HIPAA' | 'SOC2' | 'CCPA' | 'LGPD';

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  standard: ComplianceStandard;
  requirement: string;
  check: (context: Record<string, any>) => boolean | Promise<boolean>;
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
}

export interface ComplianceCheckResult {
  ruleId: string;
  ruleName: string;
  standard: ComplianceStandard;
  passed: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: number;
}

export interface ComplianceReport {
  timestamp: number;
  standards: ComplianceStandard[];
  totalRules: number;
  passedRules: number;
  failedRules: number;
  criticalFailures: number;
  complianceScore: number; // 0-100
  isCompliant: boolean;
  results: ComplianceCheckResult[];
}

export interface DataRetentionPolicy {
  dataType: string;
  retentionPeriod: number; // ms
  archiveAfter: number; // ms
  deleteAfter: number; // ms
  anonymizeAfter: number; // ms
}

/**
 * Compliance Manager
 */
export class ComplianceManager {
  private rules: Map<string, ComplianceRule> = new Map();
  private checkResults: ComplianceCheckResult[] = [];
  private dataRetentionPolicies: Map<string, DataRetentionPolicy> = new Map();
  private auditLog: Array<{ action: string; timestamp: number; details: Record<string, any> }> = [];

  /**
   * Register compliance rule
   */
  registerRule(rule: ComplianceRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Register multiple rules
   */
  registerRules(rules: ComplianceRule[]): void {
    for (const rule of rules) {
      this.registerRule(rule);
    }
  }

  /**
   * Run compliance check
   */
  async runCheck(ruleId: string, context: Record<string, any>): Promise<ComplianceCheckResult | null> {
    const rule = this.rules.get(ruleId);
    if (!rule || !rule.enabled) return null;

    try {
      const passed = await rule.check(context);

      const result: ComplianceCheckResult = {
        ruleId: rule.id,
        ruleName: rule.name,
        standard: rule.standard,
        passed,
        severity: rule.severity,
        message: passed ? `✓ ${rule.name}` : `✗ ${rule.name}: ${rule.requirement}`,
        timestamp: Date.now(),
      };

      this.checkResults.push(result);
      this.logAuditEvent('compliance_check', { ruleId, passed });

      return result;
    } catch (error) {
      const result: ComplianceCheckResult = {
        ruleId: rule.id,
        ruleName: rule.name,
        standard: rule.standard,
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
   * Run all compliance checks
   */
  async runAllChecks(context: Record<string, any>): Promise<ComplianceReport> {
    this.checkResults = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      await this.runCheck(rule.id, context);
    }

    return this.generateReport();
  }

  /**
   * Run checks for standard
   */
  async runStandardChecks(standard: ComplianceStandard, context: Record<string, any>): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled || rule.standard !== standard) continue;

      const result = await this.runCheck(rule.id, context);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Generate compliance report
   */
  private generateReport(): ComplianceReport {
    const standards = Array.from(new Set(Array.from(this.rules.values()).map(r => r.standard)));

    const passedRules = this.checkResults.filter(r => r.passed).length;
    const failedRules = this.checkResults.filter(r => !r.passed).length;
    const criticalFailures = this.checkResults.filter(r => !r.passed && r.severity === 'critical').length;

    const complianceScore = this.checkResults.length > 0
      ? (passedRules / this.checkResults.length) * 100
      : 0;

    return {
      timestamp: Date.now(),
      standards,
      totalRules: this.checkResults.length,
      passedRules,
      failedRules,
      criticalFailures,
      complianceScore: Math.round(complianceScore),
      isCompliant: criticalFailures === 0,
      results: [...this.checkResults],
    };
  }

  /**
   * Set data retention policy
   */
  setRetentionPolicy(policy: DataRetentionPolicy): void {
    this.dataRetentionPolicies.set(policy.dataType, policy);
  }

  /**
   * Get retention policy
   */
  getRetentionPolicy(dataType: string): DataRetentionPolicy | null {
    return this.dataRetentionPolicies.get(dataType) || null;
  }

  /**
   * Check if data should be deleted
   */
  shouldDeleteData(dataType: string, createdAt: number): boolean {
    const policy = this.dataRetentionPolicies.get(dataType);
    if (!policy) return false;

    const age = Date.now() - createdAt;
    return age > policy.deleteAfter;
  }

  /**
   * Check if data should be anonymized
   */
  shouldAnonymizeData(dataType: string, createdAt: number): boolean {
    const policy = this.dataRetentionPolicies.get(dataType);
    if (!policy) return false;

    const age = Date.now() - createdAt;
    return age > policy.anonymizeAfter && age <= policy.deleteAfter;
  }

  /**
   * Check if data should be archived
   */
  shouldArchiveData(dataType: string, createdAt: number): boolean {
    const policy = this.dataRetentionPolicies.get(dataType);
    if (!policy) return false;

    const age = Date.now() - createdAt;
    return age > policy.archiveAfter && age <= policy.anonymizeAfter;
  }

  /**
   * Log audit event
   */
  logAuditEvent(action: string, details: Record<string, any> = {}): void {
    this.auditLog.push({
      action,
      timestamp: Date.now(),
      details,
    });

    // Keep only last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(limit: number = 100): Array<{ action: string; timestamp: number; details: Record<string, any> }> {
    return this.auditLog.slice(-limit);
  }

  /**
   * Get audit log by action
   */
  getAuditLogByAction(action: string, limit: number = 100): Array<{ action: string; timestamp: number; details: Record<string, any> }> {
    return this.auditLog
      .filter(entry => entry.action === action)
      .slice(-limit);
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
   * Get compliance status
   */
  getComplianceStatus(): {
    isCompliant: boolean;
    criticalFailures: number;
    complianceScore: number;
    lastCheck: number;
  } {
    if (this.checkResults.length === 0) {
      return {
        isCompliant: true,
        criticalFailures: 0,
        complianceScore: 100,
        lastCheck: 0,
      };
    }

    const report = this.generateReport();

    return {
      isCompliant: report.isCompliant,
      criticalFailures: report.criticalFailures,
      complianceScore: report.complianceScore,
      lastCheck: report.timestamp,
    };
  }

  /**
   * Get standards compliance status
   */
  getStandardsStatus(): Record<string, { compliant: boolean; score: number }> {
    const status: Record<string, { compliant: boolean; score: number }> = {};

    const standards = Array.from(new Set(Array.from(this.rules.values()).map(r => r.standard)));

    for (const standard of standards) {
      const standardResults = this.checkResults.filter(r => r.standard === standard);

      if (standardResults.length === 0) {
        status[standard] = { compliant: true, score: 100 };
        continue;
      }

      const passed = standardResults.filter(r => r.passed).length;
      const score = (passed / standardResults.length) * 100;
      const criticalFailures = standardResults.filter(r => !r.passed && r.severity === 'critical').length;

      status[standard] = {
        compliant: criticalFailures === 0,
        score: Math.round(score),
      };
    }

    return status;
  }

  /**
   * Generate compliance certificate
   */
  generateComplianceCertificate(): string {
    const status = this.getComplianceStatus();
    const standardsStatus = this.getStandardsStatus();

    let certificate = `
Compliance Certificate
======================
Generated: ${new Date().toISOString()}
Overall Compliance: ${status.isCompliant ? 'YES' : 'NO'}
Compliance Score: ${status.complianceScore}%
Critical Failures: ${status.criticalFailures}

Standards:
`;

    for (const [standard, stdStatus] of Object.entries(standardsStatus)) {
      certificate += `- ${standard}: ${stdStatus.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'} (${stdStatus.score}%)\n`;
    }

    return certificate;
  }

  /**
   * Clear results
   */
  clearResults(): void {
    this.checkResults = [];
  }
}

/**
 * Standard Compliance Rules
 */
export const StandardComplianceRules = {
  /**
   * GDPR data access rule
   */
  gdprDataAccess: (): ComplianceRule => ({
    id: 'gdpr_data_access',
    name: 'GDPR Data Access',
    description: 'Users can access their data',
    standard: 'GDPR' as const,
    requirement: 'Right to access personal data',
    check: (context: Record<string, any>) => !!context.dataAccessEndpoint,
    severity: 'critical',
    enabled: true,
  }),

  /**
   * GDPR data deletion rule
   */
  gdprDataDeletion: (): ComplianceRule => ({
    id: 'gdpr_data_deletion',
    name: 'GDPR Data Deletion',
    description: 'Users can request data deletion',
    standard: 'GDPR' as const,
    requirement: 'Right to be forgotten',
    check: (context: Record<string, any>) => !!context.dataDeletionEndpoint,
    severity: 'critical',
    enabled: true,
  }),

  /**
   * HIPAA encryption rule
   */
  hipaaEncryption: (): ComplianceRule => ({
    id: 'hipaa_encryption',
    name: 'HIPAA Encryption',
    description: 'Patient data is encrypted',
    standard: 'HIPAA' as const,
    requirement: 'Encryption of PHI at rest and in transit',
    check: (context: Record<string, any>) => !!context.encryptionEnabled,
    severity: 'critical',
    enabled: true,
  }),

  /**
   * HIPAA audit logging rule
   */
  hipaaAuditLogging: (): ComplianceRule => ({
    id: 'hipaa_audit_logging',
    name: 'HIPAA Audit Logging',
    description: 'All access to patient data is logged',
    standard: 'HIPAA' as const,
    requirement: 'Audit controls and logging',
    check: (context: Record<string, any>) => !!context.auditLoggingEnabled,
    severity: 'critical',
    enabled: true,
  }),

  /**
   * SOC2 access control rule
   */
  soc2AccessControl: (): ComplianceRule => ({
    id: 'soc2_access_control',
    name: 'SOC2 Access Control',
    description: 'Access control mechanisms are in place',
    standard: 'SOC2' as const,
    requirement: 'Logical access controls',
    check: (context: Record<string, any>) => !!context.rbacEnabled,
    severity: 'high',
    enabled: true,
  }),
};

/**
 * Create compliance manager
 */
export function createComplianceManager(): ComplianceManager {
  return new ComplianceManager();
}

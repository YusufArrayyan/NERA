/**
 * Integration Testing Module
 * E2E workflows, data integrity, workflow validation
 */

export {
  E2EOrchestrator,
  createE2EOrchestrator,
  E2ETestCase,
  E2EStep,
  E2ETestResult,
  E2ETestSuite,
} from './e2e-orchestrator';

export {
  DataIntegrityChecker,
  createDataIntegrityChecker,
  IntegrityRule,
  IntegrityCheckResult,
  DataIntegrityReport,
  StandardIntegrityRules,
} from './data-integrity-checker';

export {
  WorkflowValidator,
  createWorkflowValidator,
  WorkflowState,
  StateTransition,
  WorkflowDefinition,
  WorkflowExecutionContext,
} from './workflow-validator';

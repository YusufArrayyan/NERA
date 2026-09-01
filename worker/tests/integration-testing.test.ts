/**
 * Integration Testing Module Tests
 * E2E workflows, data integrity, workflow validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  E2EOrchestrator,
  E2ETestCase,
  E2ETestSuite,
  DataIntegrityChecker,
  StandardIntegrityRules,
  WorkflowValidator,
  WorkflowDefinition,
  createE2EOrchestrator,
  createDataIntegrityChecker,
  createWorkflowValidator,
} from '../src/modules/testing';

describe('E2E Orchestrator', () => {
  let orchestrator: E2EOrchestrator;

  beforeEach(() => {
    orchestrator = createE2EOrchestrator();
  });

  it('should register test suite', () => {
    const suite: E2ETestSuite = {
      name: 'User Flow',
      tests: [],
    };

    orchestrator.registerSuite('user-flow', suite);

    const registered = orchestrator.getSuite('user-flow');
    expect(registered).toBeDefined();
    expect(registered?.name).toBe('User Flow');
  });

  it('should run single test case', async () => {
    const testCase: E2ETestCase = {
      id: 'test1',
      name: 'Create User',
      description: 'Test user creation',
      steps: [
        {
          id: 'step1',
          name: 'Create user',
          action: 'create',
          target: 'users',
          payload: { email: 'test@example.com' },
        },
      ],
      expectedResult: { created: true },
      timeout: 5000,
      retryable: false,
      tags: ['user', 'critical'],
    };

    const result = await orchestrator.runTest(testCase);

    expect(result).toBeDefined();
    expect(result.testId).toBe('test1');
    expect(result.status).toBe('passed');
    expect(result.stepsCompleted).toBe(1);
    expect(result.totalSteps).toBe(1);
  });

  it('should track test metrics', async () => {
    const testCase: E2ETestCase = {
      id: 'test2',
      name: 'Query Data',
      description: 'Test query performance',
      steps: [
        {
          id: 'step1',
          name: 'Query users',
          action: 'query',
          target: 'users',
          payload: { filter: 'active' },
        },
        {
          id: 'step2',
          name: 'Aggregate results',
          action: 'compute',
          target: 'analytics',
          payload: { operation: 'sum' },
        },
      ],
      expectedResult: { aggregated: true },
      timeout: 5000,
      retryable: false,
      tags: ['analytics'],
    };

    const result = await orchestrator.runTest(testCase);

    expect(result.metrics).toBeDefined();
    expect(result.metrics.avgResponseTime).toBeGreaterThanOrEqual(0);
    expect(result.metrics.slowestStep).toBeDefined();
    expect(result.metrics.fastestStep).toBeDefined();
  });

  it('should run test suite', async () => {
    const suite: E2ETestSuite = {
      name: 'User Management',
      tests: [
        {
          id: 'test1',
          name: 'Create user',
          description: 'Create new user',
          steps: [
            {
              id: 'step1',
              action: 'create',
              name: 'create',
              target: 'users',
              payload: { email: 'test1@example.com' },
            },
          ],
          expectedResult: { created: true },
          timeout: 5000,
          retryable: false,
          tags: ['user'],
        },
        {
          id: 'test2',
          name: 'Update user',
          description: 'Update user profile',
          steps: [
            {
              id: 'step1',
              action: 'update',
              name: 'update',
              target: 'users',
              payload: { id: 'user1', name: 'Updated' },
            },
          ],
          expectedResult: { updated: true },
          timeout: 5000,
          retryable: false,
          tags: ['user'],
        },
      ],
      beforeAll: async () => {
        // Setup
      },
      afterAll: async () => {
        // Cleanup
      },
    };

    orchestrator.registerSuite('user-mgmt', suite);

    const results = await orchestrator.runSuite('user-mgmt');

    expect(results).toBeDefined();
    expect(results.length).toBe(2);
    expect(results[0].status).toBe('passed');
    expect(results[1].status).toBe('passed');
  });

  it('should generate test report', async () => {
    const testCase: E2ETestCase = {
      id: 'test1',
      name: 'Simple Test',
      description: 'Simple test',
      steps: [
        {
          id: 'step1',
          action: 'create',
          name: 'create',
          target: 'items',
        },
      ],
      expectedResult: {},
      timeout: 5000,
      retryable: false,
      tags: [],
    };

    await orchestrator.runTest(testCase);

    const report = orchestrator.generateReport();

    expect(report).toBeDefined();
    expect(report).toContain('E2E Test Report');
    expect(report).toContain('Pass Rate');
  });

  it('should track overall summary', async () => {
    const testCase1: E2ETestCase = {
      id: 'test1',
      name: 'Test 1',
      description: 'Test 1',
      steps: [{ id: 'step1', action: 'create', name: 'create', target: 'items' }],
      expectedResult: {},
      timeout: 5000,
      retryable: false,
      tags: [],
    };

    const testCase2: E2ETestCase = {
      id: 'test2',
      name: 'Test 2',
      description: 'Test 2',
      steps: [{ id: 'step1', action: 'read', name: 'read', target: 'items' }],
      expectedResult: {},
      timeout: 5000,
      retryable: false,
      tags: [],
    };

    await orchestrator.runTest(testCase1);
    await orchestrator.runTest(testCase2);

    const summary = orchestrator.getOverallSummary();

    expect(summary.totalTests).toBe(2);
    expect(summary.passedTests).toBe(2);
    expect(summary.passRate).toBe(100);
  });
});

describe('Data Integrity Checker', () => {
  let checker: DataIntegrityChecker;

  beforeEach(() => {
    checker = createDataIntegrityChecker();
  });

  it('should register integrity rule', () => {
    const rule = StandardIntegrityRules.nullCheck('email');
    checker.registerRule(rule);

    const retrieved = checker.getRule('null_check_email');
    expect(retrieved).toBeDefined();
  });

  it('should validate schema', async () => {
    const rule = StandardIntegrityRules.schemaValidation(['id', 'email', 'name']);
    checker.registerRule(rule);

    const data = { id: 1, email: 'test@example.com', name: 'Test User' };

    const result = await checker.runCheck('schema_validation', data);

    expect(result).toBeDefined();
    expect(result?.passed).toBe(true);
  });

  it('should detect missing required fields', async () => {
    const rule = StandardIntegrityRules.schemaValidation(['id', 'email']);
    checker.registerRule(rule);

    const data = { id: 1 }; // missing email

    const result = await checker.runCheck('schema_validation', data);

    expect(result).toBeDefined();
    expect(result?.passed).toBe(false);
  });

  it('should validate data types', async () => {
    const rule = StandardIntegrityRules.typeValidation({
      id: 'number',
      email: 'string',
      active: 'boolean',
    });
    checker.registerRule(rule);

    const data = { id: 1, email: 'test@example.com', active: true };

    const result = await checker.runCheck('type_validation', data);

    expect(result?.passed).toBe(true);
  });

  it('should detect type mismatches', async () => {
    const rule = StandardIntegrityRules.typeValidation({
      id: 'number',
      email: 'string',
    });
    checker.registerRule(rule);

    const data = { id: 'not_a_number', email: 'test@example.com' };

    const result = await checker.runCheck('type_validation', data);

    expect(result?.passed).toBe(false);
  });

  it('should validate range constraints', async () => {
    const rule = StandardIntegrityRules.rangeValidation('score', 0, 100);
    checker.registerRule(rule);

    const validData = { score: 50 };
    const invalidData = { score: 150 };

    const validResult = await checker.runCheck('range_validation_score', validData);
    const invalidResult = await checker.runCheck('range_validation_score', invalidData);

    expect(validResult?.passed).toBe(true);
    expect(invalidResult?.passed).toBe(false);
  });

  it('should run all checks', async () => {
    checker.registerRule(StandardIntegrityRules.schemaValidation(['id', 'email']));
    checker.registerRule(StandardIntegrityRules.typeValidation({ id: 'number' }));
    checker.registerRule(StandardIntegrityRules.nullCheck('email'));

    const data = { id: 1, email: 'test@example.com' };

    const report = await checker.runAllChecks(data);

    expect(report.totalChecks).toBe(3);
    expect(report.passedChecks).toBeGreaterThan(0);
    expect(report.isHealthy).toBe(true);
  });

  it('should track critical issues', async () => {
    const rule = {
      id: 'critical_rule',
      name: 'Critical Rule',
      description: 'Critical validation',
      check: () => false,
      severity: 'critical' as const,
      enabled: true,
    };

    checker.registerRule(rule);

    const data = {};
    const report = await checker.runAllChecks(data);

    expect(report.criticalIssues).toBeGreaterThan(0);
    expect(report.isHealthy).toBe(false);
  });
});

describe('Workflow Validator', () => {
  let validator: WorkflowValidator;

  beforeEach(() => {
    validator = createWorkflowValidator();
  });

  it('should register workflow', () => {
    const workflow: WorkflowDefinition = {
      id: 'user-creation',
      name: 'User Creation',
      description: 'Complete user creation workflow',
      initialState: 'init',
      states: ['init', 'running', 'completed', 'failed'],
      transitions: [
        { from: 'init', to: 'running' },
        { from: 'running', to: 'completed' },
        { from: 'running', to: 'failed' },
      ],
      timeoutMs: 30000,
      maxRetries: 3,
    };

    validator.registerWorkflow(workflow);

    const retrieved = validator.getWorkflow('user-creation');
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('User Creation');
  });

  it('should start workflow execution', () => {
    const workflow: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test',
      description: 'Test workflow',
      initialState: 'init',
      states: ['init', 'running', 'completed'],
      transitions: [{ from: 'init', to: 'running' }, { from: 'running', to: 'completed' }],
      timeoutMs: 30000,
      maxRetries: 3,
    };

    validator.registerWorkflow(workflow);
    const context = validator.startExecution('test-workflow');

    expect(context).toBeDefined();
    expect(context?.currentState).toBe('init');
    expect(context?.stateHistory.length).toBe(1);
  });

  it('should transition states', async () => {
    const workflow: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test',
      description: 'Test workflow',
      initialState: 'init',
      states: ['init', 'running', 'completed'],
      transitions: [{ from: 'init', to: 'running' }, { from: 'running', to: 'completed' }],
      timeoutMs: 30000,
      maxRetries: 3,
    };

    validator.registerWorkflow(workflow);
    validator.startExecution('test-workflow');

    const transitioned = await validator.transitionState('test-workflow', 'running');

    expect(transitioned).toBe(true);

    const context = validator.getExecutionContext('test-workflow');
    expect(context?.currentState).toBe('running');
  });

  it('should prevent invalid transitions', async () => {
    const workflow: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test',
      description: 'Test workflow',
      initialState: 'init',
      states: ['init', 'running', 'completed'],
      transitions: [{ from: 'init', to: 'running' }, { from: 'running', to: 'completed' }],
      timeoutMs: 30000,
      maxRetries: 3,
    };

    validator.registerWorkflow(workflow);
    validator.startExecution('test-workflow');

    const transitioned = await validator.transitionState('test-workflow', 'completed');

    expect(transitioned).toBe(false);
  });

  it('should complete workflow', async () => {
    const workflow: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test',
      description: 'Test workflow',
      initialState: 'init',
      states: ['init', 'running', 'completed'],
      transitions: [{ from: 'init', to: 'running' }, { from: 'running', to: 'completed' }],
      timeoutMs: 30000,
      maxRetries: 3,
    };

    validator.registerWorkflow(workflow);
    validator.startExecution('test-workflow');
    await validator.transitionState('test-workflow', 'running');
    const completed = await validator.completeWorkflow('test-workflow');

    expect(completed).toBe(true);

    const context = validator.getExecutionContext('test-workflow');
    expect(context?.currentState).toBe('completed');
    expect(context?.endTime).toBeDefined();
  });

  it('should track state history', async () => {
    const workflow: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test',
      description: 'Test workflow',
      initialState: 'init',
      states: ['init', 'running', 'paused', 'completed'],
      transitions: [
        { from: 'init', to: 'running' },
        { from: 'running', to: 'paused' },
        { from: 'paused', to: 'running' },
        { from: 'running', to: 'completed' },
      ],
      timeoutMs: 30000,
      maxRetries: 3,
    };

    validator.registerWorkflow(workflow);
    validator.startExecution('test-workflow');
    await validator.transitionState('test-workflow', 'running');
    validator.pauseWorkflow('test-workflow');
    validator.resumeWorkflow('test-workflow');

    const path = validator.getWorkflowPath('test-workflow');

    expect(path.length).toBe(4);
    expect(path[0]).toBe('init');
    expect(path[1]).toBe('running');
    expect(path[2]).toBe('paused');
    expect(path[3]).toBe('running');
  });

  it('should generate execution report', async () => {
    const workflow: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      description: 'Test workflow',
      initialState: 'init',
      states: ['init', 'running', 'completed'],
      transitions: [{ from: 'init', to: 'running' }, { from: 'running', to: 'completed' }],
      timeoutMs: 30000,
      maxRetries: 3,
    };

    validator.registerWorkflow(workflow);
    validator.startExecution('test-workflow');
    await validator.transitionState('test-workflow', 'running');
    await validator.completeWorkflow('test-workflow');

    const report = validator.generateExecutionReport('test-workflow');

    expect(report).toContain('Test Workflow');
    expect(report).toContain('completed');
    expect(report).toContain('State History');
  });

  it('should track completion rate', async () => {
    const workflow: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test',
      description: 'Test workflow',
      initialState: 'init',
      states: ['init', 'running', 'completed'],
      transitions: [{ from: 'init', to: 'running' }, { from: 'running', to: 'completed' }],
      timeoutMs: 30000,
      maxRetries: 3,
    };

    validator.registerWorkflow(workflow);

    // Start 3 executions
    validator.startExecution('test-workflow');
    await validator.completeWorkflow('test-workflow');

    const completionRate = validator.getCompletionRate();

    expect(completionRate).toBeGreaterThanOrEqual(0);
    expect(completionRate).toBeLessThanOrEqual(100);
  });
});

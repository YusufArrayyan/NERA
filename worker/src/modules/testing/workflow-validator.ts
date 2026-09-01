/**
 * Workflow Validator
 * Validates E2E workflows and state transitions
 */

export type WorkflowState = 'init' | 'running' | 'paused' | 'completed' | 'failed' | 'rolled_back';

export interface StateTransition {
  from: WorkflowState;
  to: WorkflowState;
  condition?: (context: Record<string, any>) => boolean;
  action?: (context: Record<string, any>) => Promise<void>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  initialState: WorkflowState;
  states: WorkflowState[];
  transitions: StateTransition[];
  timeoutMs: number;
  maxRetries: number;
}

export interface WorkflowExecutionContext {
  workflowId: string;
  currentState: WorkflowState;
  startTime: number;
  endTime: number | null;
  duration: number;
  stateHistory: { state: WorkflowState; timestamp: number }[];
  data: Record<string, any>;
  retryCount: number;
  error: string | null;
  rollbackPerformed: boolean;
}

/**
 * Workflow Validator
 */
export class WorkflowValidator {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executionContexts: Map<string, WorkflowExecutionContext> = new Map();

  /**
   * Register workflow
   */
  registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
  }

  /**
   * Get workflow
   */
  getWorkflow(workflowId: string): WorkflowDefinition | null {
    return this.workflows.get(workflowId) || null;
  }

  /**
   * Start workflow execution
   */
  startExecution(workflowId: string): WorkflowExecutionContext | null {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    const context: WorkflowExecutionContext = {
      workflowId,
      currentState: workflow.initialState,
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      stateHistory: [{ state: workflow.initialState, timestamp: Date.now() }],
      data: {},
      retryCount: 0,
      error: null,
      rollbackPerformed: false,
    };

    this.executionContexts.set(workflowId, context);
    return context;
  }

  /**
   * Transition state
   */
  async transitionState(
    workflowId: string,
    toState: WorkflowState,
    data?: Record<string, any>
  ): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    const context = this.executionContexts.get(workflowId);
    if (!context) return false;

    // Find valid transition
    const transition = workflow.transitions.find(
      t => t.from === context.currentState && t.to === toState
    );

    if (!transition) {
      return false; // Invalid transition
    }

    // Check condition
    if (transition.condition && !transition.condition(context.data)) {
      return false;
    }

    // Check timeout
    const duration = Date.now() - context.startTime;
    if (duration > workflow.timeoutMs) {
      context.error = 'Workflow timeout exceeded';
      context.rollbackPerformed = true;
      return false;
    }

    // Execute action
    if (transition.action) {
      try {
        if (data) {
          context.data = { ...context.data, ...data };
        }
        await transition.action(context.data);
      } catch (error) {
        context.error = (error as Error).message;
        context.retryCount++;

        if (context.retryCount >= workflow.maxRetries) {
          context.rollbackPerformed = true;
          return false;
        }

        return false;
      }
    }

    // Update context
    context.currentState = toState;
    context.stateHistory.push({ state: toState, timestamp: Date.now() });
    context.duration = Date.now() - context.startTime;

    if (toState === 'completed') {
      context.endTime = Date.now();
    }

    return true;
  }

  /**
   * Get execution context
   */
  getExecutionContext(workflowId: string): WorkflowExecutionContext | null {
    return this.executionContexts.get(workflowId) || null;
  }

  /**
   * Complete workflow
   */
  completeWorkflow(workflowId: string): boolean {
    const context = this.executionContexts.get(workflowId);
    if (!context) return false;

    return this.transitionState(workflowId, 'completed');
  }

  /**
   * Fail workflow
   */
  failWorkflow(workflowId: string, error: string): boolean {
    const context = this.executionContexts.get(workflowId);
    if (!context) return false;

    context.error = error;
    context.currentState = 'failed';
    context.endTime = Date.now();
    context.stateHistory.push({ state: 'failed', timestamp: Date.now() });

    return true;
  }

  /**
   * Pause workflow
   */
  pauseWorkflow(workflowId: string): boolean {
    const context = this.executionContexts.get(workflowId);
    if (!context) return false;

    context.currentState = 'paused';
    context.stateHistory.push({ state: 'paused', timestamp: Date.now() });

    return true;
  }

  /**
   * Resume workflow
   */
  resumeWorkflow(workflowId: string): boolean {
    const context = this.executionContexts.get(workflowId);
    if (!context || context.currentState !== 'paused') return false;

    context.currentState = 'running';
    context.stateHistory.push({ state: 'running', timestamp: Date.now() });

    return true;
  }

  /**
   * Rollback workflow
   */
  async rollbackWorkflow(workflowId: string): Promise<boolean> {
    const context = this.executionContexts.get(workflowId);
    if (!context) return false;

    context.rollbackPerformed = true;
    context.currentState = 'rolled_back';
    context.endTime = Date.now();
    context.stateHistory.push({ state: 'rolled_back', timestamp: Date.now() });

    return true;
  }

  /**
   * Validate workflow is executable
   */
  isValidWorkflow(workflowId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    // Check all states have transitions
    for (const state of workflow.states) {
      if (state === workflow.initialState) continue;

      const hasIncomingTransition = workflow.transitions.some(t => t.to === state);
      if (!hasIncomingTransition && state !== 'completed' && state !== 'failed') {
        return false;
      }
    }

    return true;
  }

  /**
   * Get workflow path
   */
  getWorkflowPath(workflowId: string): WorkflowState[] {
    const context = this.executionContexts.get(workflowId);
    if (!context) return [];

    return context.stateHistory.map(h => h.state);
  }

  /**
   * Get state duration
   */
  getStateDuration(workflowId: string, state: WorkflowState): number {
    const context = this.executionContexts.get(workflowId);
    if (!context) return 0;

    const history = context.stateHistory;
    const startIndex = history.findIndex(h => h.state === state);
    const endIndex = history.findIndex((h, i) => i > startIndex && h.state !== state);

    if (startIndex === -1) return 0;

    const startTime = history[startIndex].timestamp;
    const endTime = endIndex !== -1 ? history[endIndex].timestamp : context.duration + context.startTime;

    return endTime - startTime;
  }

  /**
   * Generate execution report
   */
  generateExecutionReport(workflowId: string): string {
    const workflow = this.workflows.get(workflowId);
    const context = this.executionContexts.get(workflowId);

    if (!workflow || !context) return '';

    let report = `
Workflow Execution Report
=========================
Workflow: ${workflow.name}
Status: ${context.currentState}
Duration: ${context.duration}ms
Start Time: ${new Date(context.startTime).toISOString()}
${context.endTime ? `End Time: ${new Date(context.endTime).toISOString()}` : 'Still running'}

State History:
`;

    for (const history of context.stateHistory) {
      report += `- ${history.state} @ ${new Date(history.timestamp).toISOString()}\n`;
    }

    if (context.error) {
      report += `\nError: ${context.error}\n`;
    }

    if (context.rollbackPerformed) {
      report += 'Rollback: Yes\n';
    }

    report += `\nRetry Count: ${context.retryCount}`;

    return report;
  }

  /**
   * Clear execution
   */
  clearExecution(workflowId: string): boolean {
    return this.executionContexts.delete(workflowId);
  }

  /**
   * Get all active executions
   */
  getActiveExecutions(): WorkflowExecutionContext[] {
    return Array.from(this.executionContexts.values()).filter(
      c => c.currentState === 'running' || c.currentState === 'paused'
    );
  }

  /**
   * Get completion rate
   */
  getCompletionRate(): number {
    const contexts = Array.from(this.executionContexts.values());
    if (contexts.length === 0) return 0;

    const completed = contexts.filter(c => c.currentState === 'completed').length;
    return (completed / contexts.length) * 100;
  }
}

/**
 * Create workflow validator
 */
export function createWorkflowValidator(): WorkflowValidator {
  return new WorkflowValidator();
}

// AI Provider Interface — allows swapping rule-based with LLM/ML providers

export interface AIAnalysis {
  focusSummary: string;
  stressSummary: string;
  overallAssessment: string;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AIRecommendation {
  type: string;
  title: string;
  content: string;
  priority: number;
}

export interface IAIProvider {
  analyzeSession(data: {
    avgFocus: number;
    avgStress: number;
    avgAttention: number;
    duration: number;
    focusDistribution: Record<string, number>;
  }): Promise<AIAnalysis>;

  generateRecommendations(context: {
    focusCategory: string;
    stressIndex: number;
    sessionCount: number;
    streak: number;
  }): Promise<AIRecommendation[]>;

  generateJournal(data: {
    avgFocus: number;
    avgStress: number;
    mood?: string;
    sessionsToday: number;
  }): Promise<{ title: string; content: string }>;

  generateReport(data: {
    period: string;
    sessions: number;
    avgFocus: number;
    avgStress: number;
    totalMinutes: number;
    improvement: number;
  }): Promise<{ summary: string; insights: string[]; suggestions: string[] }>;
}

export const AI_PROVIDER = 'AI_PROVIDER';

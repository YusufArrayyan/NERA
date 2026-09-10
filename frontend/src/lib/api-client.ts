/**
 * API Client for NERA Backend
 * Handles all HTTP requests to backend services
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  body?: any;
}

export class ApiClient {
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private static async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // EEG APIs
  static async getEEGStatus() {
    return this.request('/eeg/status');
  }

  static async startEEGSession(pattern: string = 'MODERATE_FOCUS') {
    return this.request('/eeg/start', {
      method: 'POST',
      body: { pattern },
    });
  }

  static async stopEEGSession(sessionId: string) {
    return this.request(`/eeg/stop/${sessionId}`, { method: 'POST' });
  }

  static async getSessionData(sessionId: string) {
    return this.request(`/eeg/session/${sessionId}`);
  }

  static async getUserSessions(limit: number = 20) {
    return this.request(`/eeg/sessions?limit=${limit}`);
  }

  // Analytics APIs
  static async getUserAnalytics(period: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'WEEKLY') {
    return this.request(`/analytics/user?period=${period}`);
  }

  static async getClassAnalytics() {
    return this.request('/analytics/class');
  }

  // Gamification APIs
  static async getUserBadges() {
    return this.request('/gamification/badges');
  }

  static async getUserLevel() {
    return this.request('/gamification/level');
  }

  static async getUserStreak() {
    return this.request('/gamification/streak');
  }

  // Journal APIs
  static async getJournalEntries(limit: number = 20) {
    return this.request(`/journal/entries?limit=${limit}`);
  }

  static async createJournalEntry(data: {
    mood: string;
    subject: string;
    insights: string;
    tags?: string[];
  }) {
    return this.request('/journal/entries', {
      method: 'POST',
      body: data,
    });
  }

  // Auth APIs
  static async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  static async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Learning/Courses APIs
  static async getCourses() {
    return this.request('/learning/courses');
  }

  static async getCourseById(courseId: number) {
    return this.request(`/learning/courses/${courseId}`);
  }

  static async getUserProgress(courseId: number) {
    return this.request(`/learning/progress/${courseId}`);
  }

  static async enrollCourse(courseId: number) {
    return this.request(`/learning/enroll/${courseId}`, {
      method: 'POST',
    });
  }
}

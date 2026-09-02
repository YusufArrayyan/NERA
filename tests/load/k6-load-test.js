import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Ramp to 200 users
    { duration: '5m', target: 200 },   // Stay at 200 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'errors': ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:3000';
const API_KEY = 'test-api-key';

export default function () {
  group('Health Checks', () => {
    let response = http.get(`${BASE_URL}/health`);
    check(response, {
      'health status is 200': (r) => r.status === 200,
      'health has status field': (r) => r.json('status') !== null,
    });
    apiDuration.add(response.timings.duration);
    errorRate.add(response.status !== 200);
  });

  sleep(1);

  group('Authentication', () => {
    const registerPayload = JSON.stringify({
      email: `user_${__VU}_${__ITER}@example.com`,
      username: `user_${__VU}_${__ITER}`,
      password: 'SecurePassword123!',
      firstName: 'Load',
      lastName: 'Test',
    });

    let response = http.post(`${BASE_URL}/auth/register`, registerPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    check(response, {
      'registration status is 201 or 409': (r) => r.status === 201 || r.status === 409,
    });
    apiDuration.add(response.timings.duration);
    errorRate.add(response.status > 400);

    if (response.status === 201) {
      const authToken = response.json('access_token');

      sleep(1);

      group('Protected Endpoints', () => {
        // Get user profile
        response = http.get(`${BASE_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });

        check(response, {
          'profile status is 200': (r) => r.status === 200,
          'profile has user data': (r) => r.json('id') !== null,
        });
        apiDuration.add(response.timings.duration);
        errorRate.add(response.status !== 200);

        sleep(1);

        // List sessions
        response = http.get(`${BASE_URL}/eeg/sessions`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });

        check(response, {
          'sessions list status is 200': (r) => r.status === 200,
          'sessions list is array': (r) => Array.isArray(r.json()),
        });
        apiDuration.add(response.timings.duration);
        errorRate.add(response.status !== 200);

        sleep(1);

        // Create session
        const sessionPayload = JSON.stringify({
          deviceType: 'Muse2',
          sampleRate: 256,
          channels: 4,
          duration: 300,
        });

        response = http.post(`${BASE_URL}/eeg/sessions`, sessionPayload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });

        check(response, {
          'create session status is 201': (r) => r.status === 201,
          'session has id': (r) => r.json('id') !== null,
        });
        apiDuration.add(response.timings.duration);
        errorRate.add(response.status !== 201);

        if (response.status === 201) {
          const sessionId = response.json('id');

          sleep(1);

          // Add EEG data
          const dataPayload = JSON.stringify({
            timestamp: new Date().toISOString(),
            channel_1: 0.5,
            channel_2: -0.3,
            channel_3: 0.2,
            channel_4: -0.1,
          });

          response = http.post(
            `${BASE_URL}/eeg/sessions/${sessionId}/data`,
            dataPayload,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
              },
            }
          );

          check(response, {
            'add data status is 201': (r) => r.status === 201,
            'data has id': (r) => r.json('id') !== null,
          });
          apiDuration.add(response.timings.duration);
          errorRate.add(response.status !== 201);
        }
      });
    }
  });

  sleep(2);
}

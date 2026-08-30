# NERA Testing Guide

## 🧪 Testing Framework Overview

NERA implements comprehensive testing across the entire stack:

- **Worker/Edge Layer**: Vitest (unit + integration tests)
- **Backend/Cloud API**: Jest + Supertest (E2E tests)
- **Frontend**: Playwright (E2E UI tests) - *Future*

---

## 🏗️ Test Architecture

```
NERA Testing Strategy
├── Unit Tests
│   ├── EEG Processor (signal processing)
│   ├── Device Drivers (Muse 2, NeuroSky, Simulator)
│   └── Cloud Sync (API communication)
│
├── Integration Tests
│   ├── Device Manager (multi-device support)
│   ├── EEG Pipeline (capture → process → sync)
│   ├── State Management (connection lifecycle)
│   └── Error Recovery (reconnection, signal loss)
│
├── E2E Tests
│   ├── Authentication (register, login, tokens)
│   ├── EEG Data Flow (session start → data submit → session end)
│   ├── Analytics (dashboard, trends, insights)
│   ├── Gamification (scoring, achievements)
│   ├── Learning Content (progress tracking)
│   └── Permissions (role-based access)
│
└── Performance Tests
    ├── Latency (< 50ms local processing)
    ├── Throughput (consistent sampling rates)
    ├── Memory (per-sample overhead)
    └── Scaling (multiple concurrent sessions)
```

---

## 🚀 Running Tests

### Worker Tests (Edge Layer)

```bash
# Install dependencies
cd worker
npm install

# Run all tests
npm run test:run

# Watch mode (re-run on file changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

### Backend Tests (Cloud API)

```bash
# Install dependencies
cd backend
npm install

# Setup test database
npm run test:setup

# Run E2E tests
npm run test

# Run specific test file
npm run test -- e2e.spec.ts

# Watch mode
npm run test -- --watch

# Coverage
npm run test:coverage
```

### All Tests

```bash
# Run entire test suite
./run-all-tests.sh
```

---

## 📊 Test Coverage

### Worker Integration Tests (`worker/tests/integration.test.ts`)

**Device Manager Tests:**
- ✅ Device initialization (Simulator, Muse 2, NeuroSky)
- ✅ Connection lifecycle (connect, disconnect, reconnect)
- ✅ Device status monitoring
- ✅ Device information retrieval
- ✅ Data streaming
- ✅ Device switching
- ✅ Calibration

**Data Streaming Tests:**
- ✅ Sample format validation
- ✅ Sampling rate consistency
- ✅ Data quality metrics
- ✅ Connection status callbacks
- ✅ Error handling

**EEG Processor Tests:**
- ✅ Brain wave extraction
- ✅ Focus/Relaxation scoring
- ✅ Stress level detection
- ✅ Recommendations generation
- ✅ Multi-channel support

**Simulator Tests:**
- ✅ Focus level manipulation
- ✅ Stress level simulation
- ✅ Signal loss simulation
- ✅ Battery drain simulation

**End-to-End Pipeline Tests:**
- ✅ Full capture → process → sync cycle
- ✅ Multiple consecutive sessions
- ✅ Performance benchmarks
- ✅ Latency measurements

### Backend E2E Tests (`backend/tests/e2e.spec.ts`)

**Authentication Tests:**
- ✅ User registration
- ✅ User login
- ✅ Get current user
- ✅ Token refresh

**EEG Data Tests:**
- ✅ Create EEG session
- ✅ Submit EEG data
- ✅ List user sessions
- ✅ Get session details
- ✅ End session

**Analytics Tests:**
- ✅ Analytics dashboard
- ✅ Session analytics
- ✅ Trend analysis

**Gamification Tests:**
- ✅ User gamification profile
- ✅ Leaderboard
- ✅ Achievements

**Permission Tests:**
- ✅ Teacher access control
- ✅ Parent access control
- ✅ Admin access control
- ✅ Permission denial (403)

**Error Handling Tests:**
- ✅ Missing auth token (401)
- ✅ Invalid permissions (403)
- ✅ Resource not found (404)
- ✅ Invalid request data (400)

---

## 🧪 Test Categories

### 1. Device Driver Tests

Test each EEG device driver independently:

```bash
# Test Muse 2 driver
npm run test -- --grep "Muse2Driver"

# Test NeuroSky driver
npm run test -- --grep "NeuroSkyMindWaveDriver"

# Test Simulator
npm run test -- --grep "SimulatorDriver"
```

### 2. Integration Tests

Test how components work together:

```bash
# Device Manager
npm run test -- --grep "Device Manager"

# Full pipeline
npm run test -- --grep "End-to-End Pipeline"

# Error recovery
npm run test -- --grep "Error Handling"
```

### 3. Performance Tests

Measure and validate performance:

```bash
npm run test -- --grep "Performance Tests"
```

Output includes:
- Average latency (should be < 20ms)
- Max latency (should be < 50ms)
- Sampling rate consistency (within ±30%)

### 4. Permission Tests

Verify role-based access control:

```bash
# Backend E2E tests include permission validation
npm run test -- --grep "permissions"
```

---

## 🔍 Test Examples

### Example 1: Testing Device Connection

```typescript
it('should connect to device and stream data', async () => {
  const manager = createDeviceManager({ deviceType: 'SIMULATOR' });
  await manager.initialize();

  // Connect
  await manager.connect();
  expect(manager.isConnected()).toBe(true);

  // Setup data collection
  const samples: any[] = [];
  manager.onDataReceived((sample) => {
    samples.push(sample);
  });

  // Stream for 100ms
  await manager.startStreaming();
  await new Promise(r => setTimeout(r, 100));
  await manager.stopStreaming();

  // Verify
  expect(samples.length).toBeGreaterThan(0);
  expect(samples[0].channels).toBeDefined();
  expect(samples[0].timestamp).toBeDefined();
});
```

### Example 2: Testing EEG Processing

```typescript
it('should process EEG data correctly', () => {
  const processor = new EEGProcessor('test-session');

  const eegData = {
    timestamp: Date.now(),
    channels: Array(256).fill(100), // 256 samples
    sampleRate: 256,
    duration: 1,
  };

  const result = processor.processEEGData(eegData);

  expect(result.focusScore).toBeGreaterThanOrEqual(0);
  expect(result.focusScore).toBeLessThanOrEqual(100);
  expect(result.brainWaveFrequencies).toBeDefined();
});
```

### Example 3: Testing API Endpoint

```typescript
it('POST /eeg/data - should submit EEG data', async () => {
  const response = await request(app.getHttpServer())
    .post('/eeg/data')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      session_id: sessionId,
      focus_score: 85,
      relaxation_score: 60,
      stress_level: 'low',
      brain_waves: { /* ... */ },
      timestamp: Date.now(),
    });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
});
```

---

## 📈 Coverage Reports

### Generate Coverage

```bash
# Worker
cd worker
npm run test:coverage

# Backend
cd backend
npm run test:coverage
```

### View Reports

```bash
# Worker coverage
open worker/coverage/index.html

# Backend coverage
open backend/coverage/index.html
```

### Current Coverage Goals

- **Worker**: ≥ 80% line coverage
- **Backend**: ≥ 75% line coverage

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:
- ✅ Pull requests
- ✅ Commits to main branch
- ✅ Manual trigger via Actions tab

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm run test:all
```

---

## 🐛 Debugging Tests

### Enable Debug Logging

```bash
# Worker tests with debug output
DEBUG=* npm run test:watch

# Backend tests with verbose output
npm run test -- --verbose
```

### Focus on Single Test

```typescript
// Temporarily focus on one test
it.only('should test specific behavior', async () => {
  // Test code
});

// Skip a test
it.skip('should skip this test', async () => {
  // Test code
});
```

### Interactive Debugging

```bash
# Backend
node --inspect-brk node_modules/.bin/jest --runInBand

# Worker
node --inspect-brk node_modules/.bin/vitest
```

Then open Chrome DevTools: `chrome://inspect`

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All unit tests pass: `npm run test:run`
- [ ] Coverage meets minimum thresholds
- [ ] E2E tests pass on production URLs
- [ ] Performance tests meet latency budgets
- [ ] No console errors or warnings
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Security tests pass

```bash
# Run complete pre-deployment check
./scripts/pre-deploy-check.sh
```

---

## 🚨 Troubleshooting Tests

### Test Timeout

**Problem**: Tests hang or timeout

**Solution**:
```bash
# Increase timeout
npm run test -- --testTimeout=30000

# Run with specific test
npm run test -- --testNamePattern="specific test"
```

### Database Connection Errors

**Problem**: E2E tests fail with database errors

**Solution**:
```bash
# Reset test database
npm run test:setup

# Check database connection
npm run db:migrate:test
```

### Port Already in Use

**Problem**: Tests fail with "EADDRINUSE"

**Solution**:
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different test port
TEST_PORT=3002 npm run test
```

### Flaky Tests

**Problem**: Tests pass sometimes, fail sometimes

**Solution**:
- Add more generous timeouts for network-dependent tests
- Mock external services
- Check for race conditions
- Isolate tests (remove shared state)

---

## 📚 Test Templates

### Unit Test Template

```typescript
import { describe, it, expect } from 'vitest';

describe('Component Name', () => {
  it('should do something', () => {
    // Arrange
    const input = ...;

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Integration Test Template

```typescript
describe('Integration: Feature A + Feature B', () => {
  let componentA: ComponentA;
  let componentB: ComponentB;

  beforeEach(async () => {
    componentA = new ComponentA();
    componentB = new ComponentB();
    await componentA.initialize();
  });

  it('should work together', async () => {
    await componentA.doSomething();
    const result = await componentB.processResult();
    expect(result).toBeDefined();
  });
});
```

---

## 🎯 Test Metrics

### Current Test Statistics

- **Total Tests**: 50+
- **Worker Tests**: 35+
- **Backend Tests**: 15+
- **Average Run Time**: 15s
- **Coverage**: 78% lines, 72% branches

### Performance Baselines

| Metric | Target | Current |
|--------|--------|---------|
| EEG Processing Latency | < 20ms | 8ms |
| API Response Time | < 200ms | 45ms |
| Device Connection Time | < 1s | 300ms |
| Test Suite Execution | < 30s | 15s |

---

## 🔐 Security Testing

Tests include:

- ✅ SQL injection prevention
- ✅ XSS protection validation
- ✅ CORS policy verification
- ✅ Authentication enforcement
- ✅ Authorization checks
- ✅ Rate limiting

```bash
# Run security-focused tests
npm run test -- --grep "security|auth|permission"
```

---

## 📝 Writing New Tests

### Checklist for New Test

- [ ] Clear, descriptive test name
- [ ] Follows Arrange-Act-Assert pattern
- [ ] No test interdependencies
- [ ] Proper setup/teardown
- [ ] Reasonable assertions
- [ ] Handles both success and failure cases
- [ ] Performance acceptable
- [ ] Documented if complex

---

## 🚀 Next Steps

- [ ] Add frontend E2E tests (Playwright)
- [ ] Implement visual regression testing
- [ ] Add load testing (k6 / Artillery)
- [ ] Setup test result tracking
- [ ] Add mutation testing for quality
- [ ] Implement contract testing for APIs

---

**NERA Testing: Comprehensive Coverage for Reliable Brain-Adaptive Learning** 🧠✅

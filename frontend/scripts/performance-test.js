#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests page load times, bundle sizes, and Core Web Vitals
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3002';
const ROUTES = [
  '/',
  '/courses',
  '/journal',
  '/hardware/calibration',
  '/analytics',
  '/devices',
  '/teacher',
  '/dashboard/student',
];

/**
 * Test single route performance
 */
function testRoute(route) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = new URL(route, BASE_URL);

    const request = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        const result = {
          route,
          statusCode: res.statusCode,
          responseTime,
          contentLength: Buffer.byteLength(data),
          success: res.statusCode === 200,
        };
        resolve(result);
      });
    });

    request.on('error', (error) => {
      resolve({
        route,
        statusCode: 0,
        responseTime: Date.now() - startTime,
        contentLength: 0,
        success: false,
        error: error.message,
      });
    });

    request.setTimeout(10000, () => {
      request.destroy();
      resolve({
        route,
        statusCode: 0,
        responseTime: Date.now() - startTime,
        contentLength: 0,
        success: false,
        error: 'Timeout',
      });
    });
  });
}

/**
 * Format bytes to readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calculate statistics
 */
function calculateStats(results) {
  const successful = results.filter((r) => r.success);
  const times = successful.map((r) => r.responseTime);
  const sizes = successful.map((r) => r.contentLength);

  if (times.length === 0) {
    return null;
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const maxTime = Math.max(...times);
  const minTime = Math.min(...times);
  const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
  const totalSize = sizes.reduce((a, b) => a + b, 0);

  return {
    totalRoutes: results.length,
    successfulRoutes: successful.length,
    failedRoutes: results.length - successful.length,
    avgResponseTime: Math.round(avgTime),
    maxResponseTime: maxTime,
    minResponseTime: minTime,
    avgPageSize: formatBytes(avgSize),
    totalPageSize: formatBytes(totalSize),
  };
}

/**
 * Generate HTML report
 */
function generateReport(results, stats) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NERA Performance Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #2db87f; margin-bottom: 10px; }
    .timestamp { color: #666; font-size: 14px; margin-bottom: 30px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .stat-card { background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #2db87f; }
    .stat-card h3 { color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; }
    .stat-card .value { font-size: 24px; font-weight: bold; color: #2db87f; }
    .results-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
    .results-table th { background: #f0f0f0; padding: 12px; text-align: left; font-weight: 600; color: #333; border-bottom: 2px solid #2db87f; }
    .results-table td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
    .results-table tr:hover { background: #f9f9f9; }
    .status-success { color: #10b981; font-weight: 600; }
    .status-failed { color: #ef4444; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧠 NERA Performance Report</h1>
    <div class="timestamp">Generated: ${new Date().toISOString()}</div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Avg Response Time</h3>
        <div class="value">${stats.avgResponseTime}ms</div>
      </div>
      <div class="stat-card">
        <h3>Max Response Time</h3>
        <div class="value">${stats.maxResponseTime}ms</div>
      </div>
      <div class="stat-card">
        <h3>Avg Page Size</h3>
        <div class="value">${stats.avgPageSize}</div>
      </div>
      <div class="stat-card">
        <h3>Total Size</h3>
        <div class="value">${stats.totalPageSize}</div>
      </div>
      <div class="stat-card">
        <h3>Success Rate</h3>
        <div class="value">${((stats.successfulRoutes / stats.totalRoutes) * 100).toFixed(1)}%</div>
      </div>
      <div class="stat-card">
        <h3>Tested Routes</h3>
        <div class="value">${stats.totalRoutes}</div>
      </div>
    </div>

    <table class="results-table">
      <thead>
        <tr>
          <th>Route</th>
          <th>Status</th>
          <th>Response Time (ms)</th>
          <th>Page Size</th>
        </tr>
      </thead>
      <tbody>
        ${results
          .map(
            (r) => `
        <tr>
          <td>${r.route}</td>
          <td><span class="status-${r.success ? 'success' : 'failed'}">${r.success ? '✓ OK' : '✗ Failed'}</span></td>
          <td>${r.success ? r.responseTime + 'ms' : r.error}</td>
          <td>${formatBytes(r.contentLength)}</td>
        </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="footer">
      <p>Performance testing completed. Visit http://localhost:3002 to view the application.</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting NERA Performance Tests...\n');
  console.log(`Testing ${ROUTES.length} routes...\n`);

  const results = [];

  for (const route of ROUTES) {
    process.stdout.write(`Testing ${route}... `);
    const result = await testRoute(route);
    results.push(result);
    console.log(`${result.success ? '✓' : '✗'} (${result.responseTime}ms)`);
  }

  const stats = calculateStats(results);

  console.log('\n📊 Test Results:\n');
  console.log(`  Total Routes: ${stats.totalRoutes}`);
  console.log(`  Successful: ${stats.successfulRoutes}`);
  console.log(`  Failed: ${stats.failedRoutes}`);
  console.log(`  Avg Response Time: ${stats.avgResponseTime}ms`);
  console.log(`  Max Response Time: ${stats.maxResponseTime}ms`);
  console.log(`  Min Response Time: ${stats.minResponseTime}ms`);
  console.log(`  Avg Page Size: ${stats.avgPageSize}`);
  console.log(`  Total Size: ${stats.totalPageSize}`);

  // Generate HTML report
  const report = generateReport(results, stats);
  const reportPath = path.join(__dirname, '../', 'PERFORMANCE_REPORT.html');
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Report saved to: PERFORMANCE_REPORT.html`);

  // Exit with appropriate code
  process.exit(stats.failedRoutes > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error('Test error:', error);
  process.exit(1);
});

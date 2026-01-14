const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

console.log(`BFF starting...`);
console.log(`Port: ${PORT}`);
console.log(`Backend URL: ${BACKEND_URL}`);

// Parse JSON bodies ONLY for BFF-specific endpoints (not proxy routes)
// If we parse all bodies, it consumes the stream and the proxy can't forward it
// We'll add express.json() selectively to routes that need it

// Rate limiting state (in-memory - in production use Redis)
let notificationCount = 0;
let windowStart = Date.now();
const RATE_LIMIT = 10; // Max notifications per minute
const WINDOW_MS = 60000; // 1 minute

// Health check endpoint
app.get('/health', (req, res) => {
  res.send('healthy');
});

// Proxy configuration for backend requests
const isDaprBackend = BACKEND_URL.includes('localhost:3500');
const proxyConfig = {
  target: BACKEND_URL,
  changeOrigin: true,
  logLevel: 'info',
  timeout: 30000, // 30 second timeout
  proxyTimeout: 30000, // 30 second proxy timeout
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] ${req.method} ${req.path} -> ${BACKEND_URL}${req.path}`);
    // Add header to show request passed through BFF
    proxyReq.setHeader('X-Proxied-By', 'BFF');

    // If using Dapr, add retry policy headers
    if (isDaprBackend) {
      proxyReq.setHeader('dapr-max-retry-count', '3');
      proxyReq.setHeader('dapr-retry-timeout', '5s');
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add headers to response to show the architecture
    proxyRes.headers['X-Served-By'] = 'Backend-API';
    proxyRes.headers['X-Proxied-Through'] = 'BFF';
    if (isDaprBackend) {
      proxyRes.headers['X-Service-Mesh'] = 'Dapr';
      proxyRes.headers['X-Dapr-Retries'] = 'Enabled (max 3)';
    }
  },
  onError: (err, req, res) => {
    console.error(`[Proxy Error] ${req.method} ${req.path}:`, err.message);
    res.status(502).json({ error: 'Bad Gateway', message: err.message });
  }
};

// BFF-specific endpoint: Notification with rate limiting and enrichment
// This endpoint adds protection and business logic before calling the backend
app.post('/api/items/:id/notify', express.json(), async (req, res) => {
  const itemId = req.params.id;
  const now = Date.now();

  console.log(`[BFF] Notification request for item ${itemId}`);

  // 1. RATE LIMITING - Global rate limit (no auth needed for demo)
  if (now - windowStart > WINDOW_MS) {
    // Reset the rate limit window
    notificationCount = 0;
    windowStart = now;
    console.log(`[BFF] Rate limit window reset`);
  }

  if (notificationCount >= RATE_LIMIT) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - windowStart)) / 1000);
    console.log(`[BFF] ⛔ Rate limit exceeded: ${notificationCount}/${RATE_LIMIT} in current window`);
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Maximum ${RATE_LIMIT} notifications per minute. Please try again later.`,
      retryAfter: retryAfter,
      currentCount: notificationCount
    });
  }

  // 2. VALIDATION - Fetch the item to ensure it exists
  let item;
  try {
    console.log(`[BFF] Fetching item ${itemId} from backend...`);
    const response = await axios.get(`${BACKEND_URL}/api/items/${itemId}`);
    item = response.data.item;
    console.log(`[BFF] ✓ Item found: "${item.title}" (status: ${item.status})`);
  } catch (err) {
    console.error(`[BFF] ✗ Item ${itemId} not found:`, err.message);
    return res.status(404).json({ error: 'Item not found' });
  }

  // 3. BUSINESS LOGIC - Don't allow notifications for completed items
  if (item.status === 'done') {
    console.log(`[BFF] ⛔ Cannot notify about completed item`);
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Cannot send notifications about completed items'
    });
  }

  // 4. ENRICHMENT - Add context that frontend doesn't have
  const enrichedRequest = {
    message: req.body.message || 'Update on this item',
    itemTitle: item.title,
    itemPriority: item.source.type, // Using source as priority for demo
    itemSource: item.source.display,
    timestamp: new Date().toISOString()
  };

  console.log(`[BFF] Enriched notification:`, JSON.stringify(enrichedRequest, null, 2));

  // 5. CALL PROTECTED BACKEND ENDPOINT
  try {
    console.log(`[BFF] Calling protected backend endpoint...`);
    const response = await axios.post(
      `${BACKEND_URL}/api/items/${itemId}/notify-team`,
      enrichedRequest
    );

    // 6. INCREMENT RATE LIMIT COUNTER
    notificationCount++;
    console.log(`[BFF] ✓ Notification sent successfully (${notificationCount}/${RATE_LIMIT} in current window)`);

    res.json({
      success: true,
      message: response.data.message,
      notificationsSent: response.data.notificationsSent,
      itemTitle: item.title,
      rateLimitRemaining: RATE_LIMIT - notificationCount
    });
  } catch (err) {
    console.error(`[BFF] ✗ Backend notification failed:`, err.message);
    res.status(502).json({
      error: 'Backend error',
      message: err.response?.data?.message || err.message
    });
  }
});

// Proxy all /api requests to the backend (except the ones we handled above)
app.use('/api', createProxyMiddleware(proxyConfig));

// Proxy Swagger UI and OpenAPI spec to the backend
app.use('/swagger', createProxyMiddleware(proxyConfig));

// Serve static files from the React build
const staticPath = path.join(__dirname, '..', 'dist');
app.use(express.static(staticPath));

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✓ BFF server listening on port ${PORT}`);
  console.log(`✓ Proxying /api/* to ${BACKEND_URL}`);
  console.log(`✓ Serving static files from ${staticPath}`);
});

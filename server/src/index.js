import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { testAgentRouter } from './routes/testAgent.js';
import { scanRouter } from './routes/scan.js';
import { snapshotsRouter } from './routes/snapshots.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors({ origin: true }));
app.use(express.json());

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api', healthRouter);
app.use('/api', testAgentRouter);
app.use('/api', scanRouter);
app.use('/api', snapshotsRouter);


// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error('[server] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`[server] RivalRadar API listening on http://localhost:${PORT}`);
  console.log(`[server] TinyFish API key configured: ${process.env.TINYFISH_API_KEY ? 'yes' : 'NO – set TINYFISH_API_KEY in server/.env'}`);
});

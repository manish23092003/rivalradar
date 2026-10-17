import { Router } from 'express';
import { listSnapshots, getSnapshotById, computeSnapshotDiff, getPreviousSnapshotForDomain } from '../services/storage.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SNAPSHOTS_DIR = path.resolve(__dirname, '../../data/snapshots');

export const snapshotsRouter = Router();

/**
 * GET /api/snapshots
 * Lists all past research snapshots
 */
snapshotsRouter.get('/snapshots', async (_req, res) => {
  try {
    const list = await listSnapshots();
    res.json({ snapshots: list });
  } catch (err) {
    console.error('[snapshots] Error listing snapshots:', err);
    res.status(500).json({ error: 'Failed to list snapshots' });
  }
});

/**
 * GET /api/snapshots/compare?id1=...&id2=...
 * Compares two snapshots by ID and returns full diff
 */
snapshotsRouter.get('/snapshots/compare', async (req, res) => {
  const { id1, id2 } = req.query;
  if (!id1 || !id2) {
    return res.status(400).json({ error: 'Both id1 and id2 query parameters are required' });
  }

  try {
    const snap1 = await getSnapshotById(id1);
    const snap2 = await getSnapshotById(id2);

    if (!snap1 || !snap2) {
      return res.status(404).json({ error: 'One or both snapshots could not be found' });
    }

    // Compare older to newer
    const older = new Date(snap1.timestamp) <= new Date(snap2.timestamp) ? snap1 : snap2;
    const newer = older === snap1 ? snap2 : snap1;

    const diff = computeSnapshotDiff(older, newer);
    res.json({ older, newer, diff });
  } catch (err) {
    console.error('[snapshots] Comparison error:', err);
    res.status(500).json({ error: 'Failed to compare snapshots' });
  }
});

/**
 * GET /api/snapshots/:id
 * Retrieves a specific snapshot
 */
snapshotsRouter.get('/snapshots/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const snap = await getSnapshotById(id);
    if (!snap) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }

    // Also look up previous snapshot for change detection
    const prevSnap = await getPreviousSnapshotForDomain(snap.targetDomain, snap.id);
    const diff = prevSnap ? computeSnapshotDiff(prevSnap, snap) : null;

    res.json({ snapshot: snap, previousSnapshot: prevSnap, diff });
  } catch (err) {
    console.error('[snapshots] Error retrieving snapshot:', err);
    res.status(500).json({ error: 'Failed to retrieve snapshot' });
  }
});

/**
 * DELETE /api/snapshots/:id
 * Deletes a snapshot
 */
snapshotsRouter.delete('/snapshots/:id', async (req, res) => {
  const { id } = req.params;
  const safeId = path.basename(id);
  const filePath = path.join(SNAPSHOTS_DIR, `${safeId}.json`);

  try {
    await fs.unlink(filePath);
    res.json({ success: true, message: `Snapshot ${safeId} deleted` });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Snapshot not found' });
    }
    console.error('[snapshots] Error deleting snapshot:', err);
    res.status(500).json({ error: 'Failed to delete snapshot' });
  }
});

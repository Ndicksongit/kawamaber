// server.js - SQLite-backed todo sync server
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'tasks.db');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function openDb() {
  ensureDataDir();
  const db = new sqlite3.Database(DB_FILE);
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT,
      completed INTEGER,
      createdAt INTEGER,
      updatedAt INTEGER
    )`);
  });
  return db;
}

const db = openDb();

function readTasks() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, title, completed, createdAt, updatedAt FROM tasks', (err, rows) => {
      if (err) return reject(err);
      const tasks = rows.map(r => ({
        id: r.id,
        title: r.title,
        completed: !!r.completed,
        createdAt: Number(r.createdAt),
        updatedAt: Number(r.updatedAt)
      }));
      resolve(tasks);
    });
  });
}

function writeTasks(tasks) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      db.run('DELETE FROM tasks', (delErr) => {
        if (delErr) return reject(delErr);
        const stmt = db.prepare('INSERT INTO tasks(id, title, completed, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)');
        for (const t of tasks) {
          stmt.run(t.id, t.title, t.completed ? 1 : 0, Number(t.createdAt || Date.now()), Number(t.updatedAt || t.createdAt || Date.now()));
        }
        stmt.finalize((finalErr) => {
          if (finalErr) return reject(finalErr);
          db.run('COMMIT', (cErr) => {
            if (cErr) return reject(cErr);
            resolve();
          });
        });
      });
    });
  });
}

function mergeTasks(serverTasks, clientTasks) {
  const byId = new Map();
  serverTasks.forEach(t => byId.set(t.id, { ...t }));
  clientTasks.forEach(ct => {
    const st = byId.get(ct.id);
    if (!st) {
      byId.set(ct.id, { ...ct });
    } else {
      const sUpdated = Number(st.updatedAt || st.createdAt || 0);
      const cUpdated = Number(ct.updatedAt || ct.createdAt || 0);
      if (cUpdated > sUpdated) {
        byId.set(ct.id, { ...ct });
      }
    }
  });
  return Array.from(byId.values()).sort((a,b) => (b.updatedAt||b.createdAt) - (a.updatedAt||a.createdAt));
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// HEAD for server reachability checks
app.head('/api/sync', (req, res) => res.status(200).end());

// Get all tasks (server state)
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (err) {
    console.error('readTasks failed', err);
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

// Merge client tasks into server storage and return merged state
app.post('/api/sync', async (req, res) => {
  const clientTasks = Array.isArray(req.body) ? req.body : (req.body.tasks || []);
  if (!Array.isArray(clientTasks)) return res.status(400).json({ error: 'Expected an array of tasks' });
  try {
    const serverTasks = await readTasks();
    const merged = mergeTasks(serverTasks, clientTasks);
    await writeTasks(merged);
    res.json({ merged, serverTime: Date.now() });
  } catch (err) {
    console.error('sync failed', err);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Individual CRUD endpoints
app.post('/api/tasks', async (req, res) => {
  const t = req.body;
  if (!t || !t.id) return res.status(400).json({ error: 'Task with id expected' });
  try {
    const serverTasks = await readTasks();
    const idx = serverTasks.findIndex(x => x.id === t.id);
    if (idx >= 0) serverTasks[idx] = t;
    else serverTasks.push(t);
    await writeTasks(serverTasks);
    res.json(t);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const t = req.body;
  try {
    const serverTasks = await readTasks();
    const idx = serverTasks.findIndex(x => x.id === id);
    if (idx >= 0) {
      serverTasks[idx] = { ...serverTasks[idx], ...t };
      await writeTasks(serverTasks);
      return res.json(serverTasks[idx]);
    } else {
      return res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const id = req.params.id;
  try {
    let serverTasks = await readTasks();
    const before = serverTasks.length;
    serverTasks = serverTasks.filter(x => x.id !== id);
    await writeTasks(serverTasks);
    res.json({ ok: true, deleted: before - serverTasks.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.listen(PORT, () => {
  console.log(`Todo sync server (SQLite) listening on http://0.0.0.0:${PORT}`);
  console.log(`Database file: ${DB_FILE}`);
});

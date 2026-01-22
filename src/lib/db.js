const Database = require("better-sqlite3");
const { getDataPaths, ensureDataDirs } = require("./config");

let dbInstance;

const REQUIRED_COLUMNS = [
  { name: "id", type: "TEXT PRIMARY KEY" },
  { name: "market_id", type: "TEXT NOT NULL" },
  { name: "market_slug", type: "TEXT" },
  { name: "market_question", type: "TEXT NOT NULL" },
  { name: "market_url", type: "TEXT NOT NULL" },
  { name: "predicted_outcome", type: "TEXT NOT NULL" },
  { name: "confidence", type: "INTEGER" },
  { name: "odds_at_prediction", type: "REAL NOT NULL" },
  { name: "status", type: "TEXT DEFAULT 'pending'" },
  { name: "winning_outcome", type: "TEXT" },
  { name: "is_correct", type: "INTEGER" },
  { name: "points", type: "REAL" },
  { name: "created_at", type: "TEXT NOT NULL" },
  { name: "resolved_at", type: "TEXT" },
  { name: "submitted_to_api", type: "INTEGER DEFAULT 0" },
  { name: "notes", type: "TEXT" }
];

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS predictions (
      id TEXT PRIMARY KEY,
      market_id TEXT NOT NULL,
      market_slug TEXT,
      market_question TEXT NOT NULL,
      market_url TEXT NOT NULL,
      predicted_outcome TEXT NOT NULL,
      confidence INTEGER,
      odds_at_prediction REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      winning_outcome TEXT,
      is_correct INTEGER,
      points REAL,
      created_at TEXT NOT NULL,
      resolved_at TEXT,
      submitted_to_api INTEGER DEFAULT 0,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_status ON predictions(status);
    CREATE INDEX IF NOT EXISTS idx_created ON predictions(created_at);
  `);

  const existing = db
    .prepare("PRAGMA table_info(predictions)")
    .all()
    .map((col) => col.name);

  for (const column of REQUIRED_COLUMNS) {
    if (!existing.includes(column.name)) {
      db.exec(
        `ALTER TABLE predictions ADD COLUMN ${column.name} ${column.type}`
      );
    }
  }
}

function getDb() {
  if (dbInstance) return dbInstance;
  ensureDataDirs();
  const { dbPath } = getDataPaths();
  dbInstance = new Database(dbPath);
  migrate(dbInstance);
  return dbInstance;
}

function insertPrediction(prediction) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO predictions (
      id, market_id, market_slug, market_question, market_url, predicted_outcome,
      confidence, odds_at_prediction, status, winning_outcome, is_correct,
      points, created_at, resolved_at, submitted_to_api, notes
    ) VALUES (
      @id, @market_id, @market_slug, @market_question, @market_url, @predicted_outcome,
      @confidence, @odds_at_prediction, @status, @winning_outcome, @is_correct,
      @points, @created_at, @resolved_at, @submitted_to_api, @notes
    )
  `);
  stmt.run(prediction);
}

function listPredictions({ status, isCorrect, resolved, limit } = {}) {
  const db = getDb();
  let query = "SELECT * FROM predictions";
  const params = [];
  const clauses = [];

  if (status) {
    clauses.push("status = ?");
    params.push(status);
  }

  if (resolved === true) {
    clauses.push("status = 'resolved'");
  }

  if (isCorrect === true) {
    clauses.push("is_correct = 1");
  }

  if (isCorrect === false) {
    clauses.push("is_correct = 0");
  }

  if (clauses.length) {
    query += ` WHERE ${clauses.join(" AND ")}`;
  }

  query += " ORDER BY datetime(created_at) DESC";
  if (limit) {
    query += " LIMIT ?";
    params.push(limit);
  }
  return db.prepare(query).all(...params);
}

function getPredictionById(id) {
  const db = getDb();
  return db.prepare("SELECT * FROM predictions WHERE id = ?").get(id);
}

function findPredictionByMarket(search) {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM predictions WHERE market_question LIKE ? ORDER BY datetime(created_at) DESC LIMIT 1"
    )
    .get(`%${search}%`);
}

function getPendingPredictions() {
  const db = getDb();
  return db
    .prepare("SELECT * FROM predictions WHERE status = 'pending'")
    .all();
}

function updatePredictionResolution({
  id,
  status,
  winning_outcome,
  is_correct,
  points,
  resolved_at
}) {
  const db = getDb();
  db.prepare(
    `
    UPDATE predictions
    SET status = ?, winning_outcome = ?, is_correct = ?, points = ?, resolved_at = ?
    WHERE id = ?
  `
  ).run(status, winning_outcome, is_correct, points, resolved_at, id);
}

function deletePrediction(id) {
  const db = getDb();
  const info = db
    .prepare("DELETE FROM predictions WHERE id = ?")
    .run(id);
  return info.changes > 0;
}

module.exports = {
  getDb,
  insertPrediction,
  listPredictions,
  getPredictionById,
  findPredictionByMarket,
  getPendingPredictions,
  updatePredictionResolution,
  deletePrediction
};

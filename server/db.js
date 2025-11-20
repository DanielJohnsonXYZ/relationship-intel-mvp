const Database = require('better-sqlite3');
const path = require('path');

// Use in-memory DB if on Vercel (read-only FS), otherwise local file
const dbPath = process.env.VERCEL ? ':memory:' : path.join(__dirname, 'relationship.db');
const db = new Database(dbPath);

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT,
    status TEXT DEFAULT 'healthy', -- healthy, risk, opportunity
    last_contact_date TEXT,
    sentiment_score REAL DEFAULT 0.5
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    platform TEXT, -- gmail, slack
    content TEXT,
    sender TEXT,
    timestamp TEXT,
    FOREIGN KEY(client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    type TEXT, -- risk, opportunity, checkin
    summary TEXT,
    confidence REAL,
    action_item TEXT,
    timestamp TEXT,
    FOREIGN KEY(client_id) REFERENCES clients(id)
  );
`);

// Seed Data (if empty)
const check = db.prepare('SELECT count(*) as count FROM clients').get();
if (check.count === 0) {
  console.log('Seeding database...');
  const insertClient = db.prepare('INSERT INTO clients (name, company, status, last_contact_date, sentiment_score) VALUES (?, ?, ?, ?, ?)');

  insertClient.run('Acme Corp', 'Acme Inc', 'risk', new Date().toISOString(), 0.3);
  insertClient.run('TechStart', 'TechStart Inc', 'opportunity', new Date().toISOString(), 0.8);
  insertClient.run('Global Partners', 'Global Partners', 'healthy', new Date(Date.now() - 86400000 * 5).toISOString(), 0.6);
}

module.exports = db;

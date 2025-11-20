const path = require('path');

let db;

// Mock DB for Vercel (Serverless/ReadOnly environment)
if (process.env.VERCEL) {
  console.log('Running in Vercel mode (Mock DB)');
  const mockData = {
    clients: [
      { id: 1, name: 'Acme Corp', company: 'Acme Inc', status: 'risk', last_contact_date: new Date().toISOString(), sentiment_score: 0.3 },
      { id: 2, name: 'TechStart', company: 'TechStart Inc', status: 'opportunity', last_contact_date: new Date().toISOString(), sentiment_score: 0.8 },
      { id: 3, name: 'Global Partners', company: 'Global Partners', status: 'healthy', last_contact_date: new Date(Date.now() - 86400000 * 5).toISOString(), sentiment_score: 0.6 }
    ],
    messages: [],
    insights: []
  };

  db = {
    prepare: (sql) => {
      const lowerSql = sql.toLowerCase();
      return {
        all: (params) => {
          if (lowerSql.includes('from clients')) return mockData.clients;
          if (lowerSql.includes('from messages')) return mockData.messages;
          if (lowerSql.includes('from insights')) return mockData.insights;
          return [];
        },
        get: (id) => {
          if (lowerSql.includes('from clients')) return mockData.clients.find(c => c.id == id);
          return null;
        },
        run: (...args) => {
          // Mock insert
          if (lowerSql.includes('insert into messages')) {
            mockData.messages.unshift({
              id: mockData.messages.length + 1,
              content: args[0], // simplified
              timestamp: new Date().toISOString(),
              platform: 'demo'
            });
          }
          if (lowerSql.includes('insert into insights')) {
            mockData.insights.unshift({
              id: mockData.insights.length + 1,
              summary: args[0], // simplified
              type: 'risk'
            });
          }
          return { lastInsertRowid: Date.now() };
        }
      };
    },
    exec: () => { } // No-op for schema creation
  };
} else {
  // Local Development (Real SQLite)
  const Database = require('better-sqlite3');
  const dbPath = path.join(__dirname, 'relationship.db');
  db = new Database(dbPath);

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
}

module.exports = db;

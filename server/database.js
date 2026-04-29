/**
 * database.js — SQLite Database Setup & Seed Data (using sql.js)
 * 
 * Initializes an in-memory SQLite database with tables for users, villages,
 * complaints, and notifications. Seeds sample data matching the portal design.
 * Data persists to a file and reloads on restart.
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'panchayat.db');

let db = null;

/**
 * Save database to file for persistence
 */
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

/**
 * Initialize the database: load from file or create fresh
 */
async function initDatabase() {
  const SQL = await initSqlJs();

  // Try to load existing database file
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('✅ Loaded existing database from file');
  } else {
    db = new SQL.Database();
    console.log('✅ Created new database');
  }

  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'villager',
    village_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS villages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Maharashtra',
    pincode TEXT NOT NULL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    priority TEXT NOT NULL DEFAULT 'Medium',
    photo_url TEXT,
    location TEXT,
    village_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    admin_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    complaint_id INTEGER,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Check if data exists
  const result = db.exec('SELECT COUNT(*) as count FROM users');
  const userCount = result.length > 0 ? result[0].values[0][0] : 0;

  if (userCount === 0) {
    seedDatabase();
  } else {
    console.log('ℹ️  Database already has data, skipping seed');
  }

  saveDatabase();
  return db;
}

function seedDatabase() {
  console.log('🌱 Seeding database with sample data...');
  const passwordHash = bcrypt.hashSync('password123', 10);

  // Villages
  db.run("INSERT INTO villages (name, district, state, pincode) VALUES ('nagpur', 'wadi', 'Maharashtra', '443304')");
  db.run("INSERT INTO villages (name, district, state, pincode) VALUES ('sindi meghe', 'wardha', 'Maharashtra', '442001')");
  db.run("INSERT INTO villages (name, district, state, pincode) VALUES ('wani', 'Yavatmal', 'Maharashtra', '442001')");

  // Users
  db.run(`INSERT INTO users (name, email, password, role, village_id) VALUES ('Pravansh Thombre', 'pravansh@gmail.com', '${passwordHash}', 'admin', 1)`);
  db.run(`INSERT INTO users (name, email, password, role, village_id) VALUES ('Pragti Ajay Khatod', 'pragti@gmail.com', '${passwordHash}', 'villager', 1)`);
  db.run(`INSERT INTO users (name, email, password, role, village_id) VALUES ('Vansh Thombre', 'vansh@gmail.com', '${passwordHash}', 'villager', 2)`);

  // 11 complaints
  const complaints = [
    ["Poor Internet Connectivity", "Slow or unreliable internet services disrupt communication, education, and business activities.", "Other", "In Progress", "Urgent", "wardha", 2, 3, "Thank you for trusting our services. We are working on this issue.", "2026-04-09"],
    ["Lack of Pedestrian-Friendly Infrastructure", "Footpaths and pedestrian crossings are either missing or poorly maintained, making it unsafe for people to walk in busy areas.", "Infrastructure", "Resolved", "Urgent", "wardha", 2, 3, "Thank you for trusting our services. The issue has been resolved.", "2026-04-09"],
    ["Electricity Leakage / Short Circuit Problem", "There are reports of electricity leakage or short circuits in the distribution system, posing safety risks such as fire hazards and electrocution dangers.", "Water Supply", "Pending", "Medium", "nagpur", 1, 2, null, "2026-04-09"],
    ["Shortage of Medical Staff in Hospitals", "Local hospitals and health centers are facing a severe shortage of doctors and nurses, leading to delayed treatments and overcrowding.", "Sanitation", "Pending", "Medium", "nagpur", 1, 2, null, "2026-04-09"],
    ["Lack of Proper Street Lighting", "Many areas in the village lack proper street lighting, making it dangerous to walk at night and increasing the risk of accidents and crime.", "Electricity", "In Progress", "Urgent", "nagpur", 1, 2, "Our team is currently assessing the situation.", "2026-04-09"],
    ["Contaminated Drinking Water", "Residents are reporting that the drinking water supply has a foul smell and yellowish color, possibly due to contamination from nearby industrial waste.", "Water Supply", "Pending", "Urgent", "nagpur", 1, 2, null, "2026-04-09"],
    ["Broken Road Near Market", "The main road near the market area has multiple potholes and cracks, causing difficulty for vehicles and pedestrians.", "Infrastructure", "In Progress", "Medium", "wani", 3, 1, null, "2026-04-09"],
    ["Clogged Drainage System", "The main drainage channel is blocked causing water logging in residential areas during rain.", "Sanitation", "Resolved", "Medium", "sindi meghe", 2, 3, "Drainage has been cleaned and repaired.", "2026-04-09"],
    ["Crop Damage Due to Flooding", "Recent heavy rainfall has caused severe flooding in agricultural fields, destroying standing crops.", "Agriculture", "In Progress", "Urgent", "nagpur", 1, 2, "Assessment team dispatched to evaluate damage.", "2026-04-09"],
    ["Irregular Water Supply", "Water supply to the village is highly irregular, with some areas receiving water only once in 3-4 days.", "Water Supply", "Resolved", "Low", "wani", 3, 1, "New pipeline installed. Regular supply restored.", "2026-04-09"],
    ["Damaged School Building", "The roof of the primary school is leaking and walls have developed cracks. Children are at risk.", "Infrastructure", "Pending", "Medium", "nagpur", 1, 2, null, "2026-04-09"]
  ];

  for (const c of complaints) {
    const resp = c[8] ? `'${c[8].replace(/'/g, "''")}'` : 'NULL';
    db.run(`INSERT INTO complaints (title, description, category, status, priority, location, village_id, user_id, admin_response, created_at) VALUES ('${c[0].replace(/'/g, "''")}', '${c[1].replace(/'/g, "''")}', '${c[2]}', '${c[3]}', '${c[4]}', '${c[5]}', ${c[6]}, ${c[7]}, ${resp}, '${c[9]}')`);
  }

  // Notifications
  db.run("INSERT INTO notifications (user_id, complaint_id, message) VALUES (2, 1, 'Your complaint status updated to In Progress')");
  db.run("INSERT INTO notifications (user_id, complaint_id, message) VALUES (3, 2, 'Your complaint has been resolved')");
  db.run("INSERT INTO notifications (user_id, complaint_id, message) VALUES (2, 5, 'Officer responded to your complaint')");

  console.log('✅ Sample data seeded: 3 villages, 3 users, 11 complaints, 3 notifications');
}

// Helper functions that mimic better-sqlite3 API style
function getDb() {
  return db;
}

function prepareGet(sql, ...params) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  if (stmt.step()) {
    const cols = stmt.getColumnNames();
    const vals = stmt.get();
    stmt.free();
    const row = {};
    cols.forEach((c, i) => row[c] = vals[i]);
    return row;
  }
  stmt.free();
  return null;
}

function prepareAll(sql, ...params) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  const cols = stmt.getColumnNames();
  while (stmt.step()) {
    const vals = stmt.get();
    const row = {};
    cols.forEach((c, i) => row[c] = vals[i]);
    rows.push(row);
  }
  stmt.free();
  return rows;
}

function runSql(sql, ...params) {
  if (params.length) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
  } else {
    db.run(sql);
  }
  // Get last insert ID
  const result = db.exec('SELECT last_insert_rowid() as id');
  const lastId = result.length > 0 ? result[0].values[0][0] : 0;
  saveDatabase();
  return { lastInsertRowid: lastId };
}

module.exports = { initDatabase, getDb, prepareGet, prepareAll, runSql, saveDatabase };

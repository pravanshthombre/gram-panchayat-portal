/**
 * database.js — Supabase PostgreSQL Database Setup
 * 
 * Connects to Supabase PostgreSQL database with tables for users, villages,
 * complaints, and notifications. Includes a compatibility layer for SQLite syntax.
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

let isInitialized = false;

function shouldSeedSampleData() {
  if (process.env.ALLOW_DB_SEED === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}

/**
 * Convert SQLite '?' parameters to Postgres '$1, $2...' format
 */
function convertSql(sql) {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

/**
 * Initialize the database: connect and create tables
 */
async function initDatabase() {
  if (isInitialized) return pool;

  console.log('Connecting to Supabase Postgres...');
  
  // Create tables
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'villager',
    village_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS villages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Maharashtra',
    pincode TEXT NOT NULL,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    complaint_id INTEGER,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Check if data exists
  const result = await pool.query('SELECT COUNT(*) as count FROM users');
  const userCount = parseInt(result.rows[0].count, 10);

  if (userCount === 0) {
    if (shouldSeedSampleData()) {
      await seedDatabase();
    } else {
      console.log('ℹ️  Database is empty and sample seeding is disabled in production');
    }
  } else {
    console.log('ℹ️  Database already has data, skipping seed');
  }

  isInitialized = true;
  return pool;
}

async function seedDatabase() {
  console.log('🌱 Seeding Supabase database with sample data...');
  const passwordHash = bcrypt.hashSync('password123', 10);

  // Villages
  await pool.query("INSERT INTO villages (name, district, state, pincode) VALUES ('nagpur', 'wadi', 'Maharashtra', '443304')");
  await pool.query("INSERT INTO villages (name, district, state, pincode) VALUES ('sindi meghe', 'wardha', 'Maharashtra', '442001')");
  await pool.query("INSERT INTO villages (name, district, state, pincode) VALUES ('wani', 'Yavatmal', 'Maharashtra', '442001')");

  // Users
  await pool.query(`INSERT INTO users (name, email, password, role, village_id) VALUES ('Pravansh Thombre', 'pravansh@gmail.com', '${passwordHash}', 'admin', 1)`);
  await pool.query(`INSERT INTO users (name, email, password, role, village_id) VALUES ('Pragti Ajay Khatod', 'pragti@gmail.com', '${passwordHash}', 'villager', 1)`);
  await pool.query(`INSERT INTO users (name, email, password, role, village_id) VALUES ('Vansh Thombre', 'vansh@gmail.com', '${passwordHash}', 'villager', 2)`);

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
    await pool.query(`INSERT INTO complaints (title, description, category, status, priority, location, village_id, user_id, admin_response, created_at) VALUES ('${c[0].replace(/'/g, "''")}', '${c[1].replace(/'/g, "''")}', '${c[2]}', '${c[3]}', '${c[4]}', '${c[5]}', ${c[6]}, ${c[7]}, ${resp}, '${c[9]}')`);
  }

  // Notifications
  await pool.query("INSERT INTO notifications (user_id, complaint_id, message) VALUES (2, 1, 'Your complaint status updated to In Progress')");
  await pool.query("INSERT INTO notifications (user_id, complaint_id, message) VALUES (3, 2, 'Your complaint has been resolved')");
  await pool.query("INSERT INTO notifications (user_id, complaint_id, message) VALUES (2, 5, 'Officer responded to your complaint')");

  console.log('✅ Supabase database seeded');
}

async function prepareGet(sql, ...params) {
  const pgSql = convertSql(sql);
  const result = await pool.query(pgSql, params);
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function prepareAll(sql, ...params) {
  const pgSql = convertSql(sql);
  const result = await pool.query(pgSql, params);
  return result.rows;
}

async function runSql(sql, ...params) {
  const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
  let pgSql = convertSql(sql);
  
  if (isInsert) {
    pgSql += ' RETURNING id';
  }

  const result = await pool.query(pgSql, params);
  
  if (isInsert && result.rows.length > 0) {
    return { lastInsertRowid: result.rows[0].id };
  }
  return { changes: result.rowCount };
}

function saveDatabase() {}

module.exports = { initDatabase, prepareGet, prepareAll, runSql, saveDatabase };

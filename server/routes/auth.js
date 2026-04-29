/**
 * auth.js — Authentication Routes (sql.js version)
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { prepareGet, runSql } = require('../database');
const { authenticateToken, generateToken } = require('../middleware/auth');
const router = express.Router();

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  try {
    const { name, email, password, role, village_id } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
    const existing = prepareGet('SELECT id FROM users WHERE email = ?', email);
    if (existing) return res.status(409).json({ error: 'Email already registered.' });
    const hash = bcrypt.hashSync(password, 10);
    const result = runSql('INSERT INTO users (name, email, password, role, village_id) VALUES (?, ?, ?, ?, ?)', name, email, hash, role || 'villager', village_id || null);
    const user = prepareGet('SELECT id, name, email, role, village_id FROM users WHERE id = ?', result.lastInsertRowid);
    const token = generateToken(user);
    res.status(201).json({ message: 'Account created!', token, user });
  } catch (err) { console.error('Signup error:', err); res.status(500).json({ error: 'Server error.' }); }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    const user = prepareGet('SELECT * FROM users WHERE email = ?', email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid email or password.' });
    const token = generateToken(user);
    const { password: _, ...safe } = user;
    res.json({ message: 'Login successful!', token, user: safe });
  } catch (err) { console.error('Login error:', err); res.status(500).json({ error: 'Server error.' }); }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = prepareGet('SELECT id, name, email, role, village_id, created_at FROM users WHERE id = ?', req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;

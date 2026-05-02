/**
 * server.js — Express Server Entry Point
 * Smart Gram Panchayat Portal Backend
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDatabase, prepareAll, prepareGet, runSql } = require('./database');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/villages', require('./routes/villages'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/analytics', require('./routes/analytics'));

// Notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifs = await prepareAll('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', req.user.id);
    const unread = (await prepareGet('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0', req.user.id)).c;
    res.json({ notifications: notifs, unread_count: unread });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

app.put('/api/notifications/read', authenticateToken, async (req, res) => {
  try {
    await runSql('UPDATE notifications SET is_read = 1 WHERE user_id = ?', req.user.id);
    res.json({ message: 'All marked as read.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Initialize database then start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🏛️  Smart Gram Panchayat Portal - Backend`);
    console.log(`   Server running on http://localhost:${PORT}\n`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

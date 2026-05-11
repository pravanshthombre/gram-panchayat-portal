/**
 * complaints.js — Complaint Routes (sql.js version)
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const { prepareGet, prepareAll, runSql } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', async (req, res) => {
  try {
    const { category, status, priority, village_id, user_id } = req.query;
    let sql = 'SELECT c.*, u.name as user_name, v.name as village_name FROM complaints c LEFT JOIN users u ON c.user_id = u.id LEFT JOIN villages v ON c.village_id = v.id WHERE 1=1';
    const params = [];
    if (category && category !== 'All') { sql += ' AND c.category = ?'; params.push(category); }
    if (status && status !== 'All') { sql += ' AND c.status = ?'; params.push(status); }
    if (priority && priority !== 'All') { sql += ' AND c.priority = ?'; params.push(priority); }
    if (village_id && village_id !== 'all') { sql += ' AND c.village_id = ?'; params.push(parseInt(village_id)); }
    if (user_id) { sql += ' AND c.user_id = ?'; params.push(parseInt(user_id)); }
    sql += ' ORDER BY c.created_at DESC';
    res.json(await prepareAll(sql, ...params));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error.' }); }
});

router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const { title, description, category, location, village_id } = req.body;
    if (!title || !description || !category) return res.status(400).json({ error: 'Title, description, category required.' });
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const vid = village_id || req.user.village_id;
    if (!vid) return res.status(400).json({ error: 'Village selection is required.' });

    const result = await runSql(
      'INSERT INTO complaints (title, description, category, photo_url, location, village_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      title, description, category, photoUrl, location || '', parseInt(vid), req.user.id
    );

    const complaint = await prepareGet(
      'SELECT c.*, u.name as user_name, v.name as village_name FROM complaints c LEFT JOIN users u ON c.user_id = u.id LEFT JOIN villages v ON c.village_id = v.id WHERE c.id = ?',
      result.lastInsertRowid
    );
    res.status(201).json({ message: 'Complaint submitted!', complaint });
  } catch (err) {
    console.error('Submission Error:', err);
    res.status(500).json({ error: 'Failed to save complaint. Please try again.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const c = await prepareGet('SELECT c.*, u.name as user_name, v.name as village_name FROM complaints c LEFT JOIN users u ON c.user_id = u.id LEFT JOIN villages v ON c.village_id = v.id WHERE c.id = ?', parseInt(req.params.id));
    if (!c) return res.status(404).json({ error: 'Not found.' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, location, status, priority, admin_response } = req.body;
    const existing = await prepareGet('SELECT * FROM complaints WHERE id = ?', parseInt(req.params.id));
    if (!existing) return res.status(404).json({ error: 'Not found.' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = existing.user_id === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'You are not authorized to update this complaint.' });
    }

    if (!isAdmin && (status !== undefined || priority !== undefined || admin_response !== undefined)) {
      return res.status(403).json({ error: 'Only admins can update status, priority, or admin response.' });
    }

    const newTitle = title !== undefined ? title : existing.title;
    const newDescription = description !== undefined ? description : existing.description;
    const newCategory = category !== undefined ? category : existing.category;
    const newLocation = location !== undefined ? location : existing.location;
    const newStatus = isAdmin ? (status || existing.status) : existing.status;
    const newPriority = isAdmin ? (priority || existing.priority) : existing.priority;
    const newResponse = isAdmin
      ? (admin_response !== undefined ? admin_response : existing.admin_response)
      : existing.admin_response;

    await runSql(
      'UPDATE complaints SET title = ?, description = ?, category = ?, location = ?, status = ?, priority = ?, admin_response = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      newTitle,
      newDescription,
      newCategory,
      newLocation,
      newStatus,
      newPriority,
      newResponse,
      parseInt(req.params.id)
    );

    if (isAdmin && status && status !== existing.status) {
      await runSql('INSERT INTO notifications (user_id, complaint_id, message) VALUES (?, ?, ?)', existing.user_id, existing.id, `Your complaint "${existing.title}" status updated to ${newStatus}`);
    }
    if (isAdmin && admin_response && admin_response !== existing.admin_response) {
      await runSql('INSERT INTO notifications (user_id, complaint_id, message) VALUES (?, ?, ?)', existing.user_id, existing.id, `Officer responded to "${existing.title}"`);
    }
    const updated = await prepareGet('SELECT c.*, u.name as user_name, v.name as village_name FROM complaints c LEFT JOIN users u ON c.user_id = u.id LEFT JOIN villages v ON c.village_id = v.id WHERE c.id = ?', parseInt(req.params.id));
    res.json({ message: 'Complaint updated!', complaint: updated });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;

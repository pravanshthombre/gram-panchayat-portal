/**
 * villages.js — Village Routes (sql.js version)
 */
const express = require('express');
const { prepareGet, prepareAll, runSql } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const villages = prepareAll('SELECT * FROM villages ORDER BY created_at DESC');
    const result = villages.map(v => {
      const total = prepareGet('SELECT COUNT(*) as c FROM complaints WHERE village_id = ?', v.id).c;
      const resolved = prepareGet("SELECT COUNT(*) as c FROM complaints WHERE village_id = ? AND status = 'Resolved'", v.id).c;
      return { ...v, total_issues: total, resolved, resolution_rate: total > 0 ? Math.round((resolved / total) * 100) : 0 };
    });
    res.json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error.' }); }
});

router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, district, state, pincode } = req.body;
    if (!name || !district || !pincode) return res.status(400).json({ error: 'Name, district, pincode required.' });
    const result = runSql('INSERT INTO villages (name, district, state, pincode, created_by) VALUES (?, ?, ?, ?, ?)', name, district, state || 'Maharashtra', pincode, req.user.id);
    const village = prepareGet('SELECT * FROM villages WHERE id = ?', result.lastInsertRowid);
    res.status(201).json({ message: 'Village registered!', village: { ...village, total_issues: 0, resolved: 0, resolution_rate: 0 } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error.' }); }
});

router.get('/:id', (req, res) => {
  try {
    const v = prepareGet('SELECT * FROM villages WHERE id = ?', parseInt(req.params.id));
    if (!v) return res.status(404).json({ error: 'Not found.' });
    const total = prepareGet('SELECT COUNT(*) as c FROM complaints WHERE village_id = ?', v.id).c;
    const resolved = prepareGet("SELECT COUNT(*) as c FROM complaints WHERE village_id = ? AND status = 'Resolved'", v.id).c;
    const inProgress = prepareGet("SELECT COUNT(*) as c FROM complaints WHERE village_id = ? AND status = 'In Progress'", v.id).c;
    const pending = prepareGet("SELECT COUNT(*) as c FROM complaints WHERE village_id = ? AND status = 'Pending'", v.id).c;
    res.json({ ...v, total_issues: total, resolved, in_progress: inProgress, pending, resolution_rate: total > 0 ? Math.round((resolved / total) * 100) : 0 });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;

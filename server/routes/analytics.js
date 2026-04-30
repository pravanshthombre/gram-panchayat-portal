/**
 * analytics.js — Analytics Routes (sql.js version)
 */
const express = require('express');
const { prepareGet, prepareAll } = require('../database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { village_id } = req.query;
    const hasFilter = village_id && village_id !== 'all';
    const params = hasFilter ? [parseInt(village_id)] : [];
    const where = hasFilter ? ' WHERE village_id = ?' : '';
    const andWhere = hasFilter ? ' AND village_id = ?' : '';

    const total = (await prepareGet(`SELECT COUNT(*) as c FROM complaints${where}`, ...params)).c;
    const pending = (await prepareGet(`SELECT COUNT(*) as c FROM complaints WHERE status = 'Pending'${andWhere}`, ...params)).c;
    const inProgress = (await prepareGet(`SELECT COUNT(*) as c FROM complaints WHERE status = 'In Progress'${andWhere}`, ...params)).c;
    const resolved = (await prepareGet(`SELECT COUNT(*) as c FROM complaints WHERE status = 'Resolved'${andWhere}`, ...params)).c;
    const categories = await prepareAll(`SELECT category, COUNT(*) as count FROM complaints${where} GROUP BY category`, ...params);
    const statuses = await prepareAll(`SELECT status, COUNT(*) as count FROM complaints${where} GROUP BY status`, ...params);

    res.json({
      total, pending, in_progress: inProgress, resolved,
      resolution_rate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      categories, statuses
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;

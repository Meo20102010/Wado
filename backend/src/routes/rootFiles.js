const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

router.get('/:name', async (req, res) => {
  try {
    const result = await query('SELECT content, content_type FROM root_files WHERE name = $1', [req.params.name]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Dosya bulunamadı' });
    res.set('Content-Type', result.rows[0].content_type);
    res.send(result.rows[0].content);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;

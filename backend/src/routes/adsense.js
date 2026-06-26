const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT client_id, ad_code, position, is_active FROM adsense_settings LIMIT 1');
    res.json({ adsense: result.rows[0] || { client_id: '', ad_code: '', position: 'home_top', is_active: false } });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;

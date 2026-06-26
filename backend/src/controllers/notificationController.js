const { query } = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json({ notifications: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ message: 'Okundu olarak işaretlendi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await query('UPDATE notifications SET read = true WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Tümü okundu olarak işaretlendi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

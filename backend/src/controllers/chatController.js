const { query } = require('../config/database');

exports.getMessages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const result = await query(
      'SELECT cm.*, u.avatar FROM chat_messages cm JOIN users u ON cm.user_id = u.id ORDER BY cm.created_at DESC LIMIT $1',
      [limit]
    );
    const messages = result.rows.reverse().map(m => ({
      id: m.id,
      userId: m.user_id,
      username: m.username,
      content: m.content,
      avatar: m.avatar,
      createdAt: m.created_at,
    }));
    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Mesaj içeriği gerekli' });
    }

    const result = await query(
      'INSERT INTO chat_messages (user_id, username, content) VALUES ($1, $2, $3) RETURNING id, content, created_at',
      [req.user.id, req.user.username, content.trim()]
    );

    const message = {
      id: result.rows[0].id,
      userId: req.user.id,
      username: req.user.username,
      content: result.rows[0].content,
      avatar: req.user.avatar,
      createdAt: result.rows[0].created_at,
    };

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM chat_messages WHERE id = $1 AND (user_id = $2 OR $3 = true) RETURNING id', [id, req.user.id, req.user.role === 'admin']);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Mesaj bulunamadı veya yetkiniz yok' });
    }
    res.json({ message: 'Mesaj silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

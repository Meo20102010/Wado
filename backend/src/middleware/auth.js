const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Yetkilendirme gerekli' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query('SELECT id, username, email, role, avatar, bio, banned, email_verified, social_links, badges, followers_count, following_count, created_at FROM users WHERE id = $1', [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
    }

    const user = result.rows[0];
    if (user.banned) {
      return res.status(403).json({ message: 'Hesabınız yasaklanmış' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Geçersiz token' });
    }
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekli' });
  }
  next();
};

module.exports = { authenticate, adminOnly };

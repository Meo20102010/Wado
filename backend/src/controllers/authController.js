const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Bu e-posta veya kullanıcı adı zaten kullanılıyor' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    const result = await query(
      'INSERT INTO users (username, email, password, verification_token) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [username, email, hashedPassword, verificationToken]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      message: 'Kayıt başarılı',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'E-posta ve şifre zorunludur' });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    const user = result.rows[0];
    if (user.banned) {
      return res.status(403).json({ message: 'Hesabınız yasaklanmıştır' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.json({ message: 'E-posta adresinize sıfırlama bağlantısı gönderildi' });
    }

    const resetToken = uuidv4();
    const expires = new Date(Date.now() + 3600000);
    await query('UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3', [resetToken, expires, email]);

    res.json({ message: 'E-posta adresinize sıfırlama bağlantısı gönderildi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const result = await query('SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()', [token]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await query('UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2', [hashedPassword, result.rows[0].id]);

    res.json({ message: 'Şifre başarıyla sıfırlandı' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await query('UPDATE users SET email_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING id', [token]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Geçersiz doğrulama bağlantısı' });
    }
    res.json({ message: 'E-posta başarıyla doğrulandı' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

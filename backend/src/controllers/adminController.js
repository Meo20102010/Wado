const { query } = require('../config/database');

exports.getStats = async (req, res) => {
  try {
    const result = await query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS users,
        (SELECT COUNT(*) FROM projects) AS projects,
        (SELECT COALESCE(SUM(downloads), 0) FROM projects) AS downloads,
        (SELECT COUNT(*) FROM sales) AS sales,
        (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days') AS monthly_active_users,
        (SELECT COUNT(*) FROM projects WHERE created_at > NOW() - INTERVAL '30 days') AS monthly_projects,
        (SELECT COALESCE(SUM(downloads), 0) FROM projects WHERE created_at > NOW() - INTERVAL '30 days') AS monthly_downloads,
        (SELECT COUNT(*) FROM sales WHERE created_at > NOW() - INTERVAL '30 days') AS monthly_sales
    `);

    res.json({ stats: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT id, username, email, role, avatar, bio, banned, email_verified, created_at FROM users';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` WHERE username ILIKE $${params.length} OR email ILIKE $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';

    const result = await query(sql, params);
    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE users SET banned = true WHERE id = $1', [id]);
    res.json({ message: 'Kullanıcı yasaklandı' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE users SET banned = false WHERE id = $1', [id]);
    res.json({ message: 'Kullanıcı yasağı kaldırıldı' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Kullanıcı silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY name');
    res.json({ categories: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    const result = await query('INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *', [name, slug, description]);
    res.status(201).json({ category: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ message: 'Bu slug zaten kullanılıyor' });
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;
    const result = await query('UPDATE categories SET name = COALESCE($1, name), slug = COALESCE($2, slug), description = COALESCE($3, description) WHERE id = $4 RETURNING *', [name, slug, description, id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Kategori bulunamadı' });
    res.json({ category: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ message: 'Kategori silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.getAds = async (req, res) => {
  try {
    const result = await query('SELECT * FROM ads ORDER BY created_at DESC');
    res.json({ ads: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.createAd = async (req, res) => {
  try {
    const { name, type, code, position, active } = req.body;
    const result = await query('INSERT INTO ads (name, type, code, position, active) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, type, code, position, active !== false]);
    res.status(201).json({ ad: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.updateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, code, position, active } = req.body;
    const result = await query(
      'UPDATE ads SET name = COALESCE($1, name), type = COALESCE($2, type), code = COALESCE($3, code), position = COALESCE($4, position), active = COALESCE($5, active), updated_at = NOW() WHERE id = $6 RETURNING *',
      [name, type, code, position, active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Reklam bulunamadı' });
    res.json({ ad: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM ads WHERE id = $1', [id]);
    res.json({ message: 'Reklam silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const result = await query('SELECT key, value FROM site_settings');
    const settings = {};
    result.rows.forEach(row => { settings[row.key] = row.value; });
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await query('INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()', [key, String(value)]);
    }
    res.json({ message: 'Ayarlar kaydedildi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Dosya gerekli' });
    const logoUrl = `/uploads/images/${req.file.filename}`;
    await query('INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', ['logo_url', logoUrl]);
    res.json({ url: logoUrl });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 200;
    const result = await query('SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT $1', [limit]);
    res.json({ messages: result.rows.reverse() });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.deleteChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM chat_messages WHERE id = $1', [id]);
    res.json({ message: 'Mesaj silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const result = await query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM projects) AS total_projects,
        (SELECT COALESCE(SUM(downloads), 0) FROM projects) AS total_downloads,
        (SELECT COUNT(*) FROM sales) AS total_sales,
        (SELECT COALESCE(SUM(amount), 0) FROM sales) AS total_revenue,
        (SELECT COUNT(*) FROM chat_messages) AS total_messages,
        (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days') AS weekly_users,
        (SELECT COUNT(*) FROM projects WHERE created_at > NOW() - INTERVAL '7 days') AS weekly_projects
    `);
    res.json({ stats: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.getRootFiles = async (req, res) => {
  try {
    const result = await query('SELECT id, name, content, content_type, updated_at FROM root_files ORDER BY name');
    res.json({ files: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.createRootFile = async (req, res) => {
  try {
    const { name, content, content_type } = req.body;
    if (!name || content === undefined) {
      return res.status(400).json({ message: 'İsim ve içerik gerekli' });
    }
    await query(
      'INSERT INTO root_files (name, content, content_type) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET content = $2, content_type = $3, updated_at = CURRENT_TIMESTAMP',
      [name, content, content_type || 'text/plain']
    );
    res.json({ message: 'Dosya kaydedildi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.deleteRootFile = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM root_files WHERE id = $1', [id]);
    res.json({ message: 'Dosya silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.getAdSense = async (req, res) => {
  try {
    const result = await query('SELECT * FROM adsense_settings LIMIT 1');
    res.json({ adsense: result.rows[0] || { client_id: '', ad_code: '', position: 'home_top', is_active: false } });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.updateAdSense = async (req, res) => {
  try {
    const { client_id, ad_code, position, is_active } = req.body;
    const existing = await query('SELECT id FROM adsense_settings LIMIT 1');
    if (existing.rows.length > 0) {
      await query(
        'UPDATE adsense_settings SET client_id = $1, ad_code = $2, position = $3, is_active = $4, updated_at = NOW() WHERE id = $5',
        [client_id || '', ad_code || '', position || 'home_top', is_active === true, existing.rows[0].id]
      );
    } else {
      await query(
        'INSERT INTO adsense_settings (client_id, ad_code, position, is_active) VALUES ($1, $2, $3, $4)',
        [client_id || '', ad_code || '', position || 'home_top', is_active === true]
      );
    }
    res.json({ message: 'AdSense ayarları güncellendi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

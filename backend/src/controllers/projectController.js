const { query } = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    const { category, sort, limit = 12, featured } = req.query;
    let sql = 'SELECT p.*, u.username AS author_username, u.avatar AS author_avatar FROM projects p JOIN users u ON p.user_id = u.id WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      sql += ` AND p.category = $${params.length}`;
    }

    if (featured === 'true') {
      sql += ' AND p.featured = true';
    }

    switch (sort) {
      case 'popular': sql += ' ORDER BY p.downloads DESC'; break;
      case 'rating': sql += ' ORDER BY p.rating DESC'; break;
      case 'downloads': sql += ' ORDER BY p.downloads DESC'; break;
      default: sql += ' ORDER BY p.created_at DESC';
    }

    sql += ` LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await query(sql, params);

    const projects = result.rows.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      type: p.type,
      category: p.category,
      version: p.version,
      price: parseFloat(p.price),
      downloads: p.downloads,
      rating: parseFloat(p.rating),
      featured: p.featured,
      createdAt: p.created_at,
      author: { username: p.author_username, avatar: p.author_avatar },
    }));

    const stats = await query(
      'SELECT (SELECT COUNT(*) FROM projects) as projects, (SELECT COUNT(*) FROM users) as users, (SELECT COALESCE(SUM(downloads), 0) FROM projects) as downloads, (SELECT COUNT(*) FROM sales) as sales'
    );

    res.json({ projects, stats: stats.rows[0] });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT p.*, u.username AS author_username, u.avatar AS author_avatar FROM projects p JOIN users u ON p.user_id = u.id WHERE p.id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Proje bulunamadı' });
    }

    const p = result.rows[0];

    await query('UPDATE projects SET views = views + 1 WHERE id = $1', [id]);

    const commentsResult = await query(
      'SELECT pc.*, u.username FROM project_comments pc JOIN users u ON pc.user_id = u.id WHERE pc.project_id = $1 ORDER BY pc.created_at DESC',
      [id]
    );

    let userRating = null;
    if (req.user) {
      const ratingResult = await query('SELECT rating FROM project_ratings WHERE project_id = $1 AND user_id = $2', [id, req.user.id]);
      if (ratingResult.rows.length > 0) userRating = ratingResult.rows[0].rating;
    }

    const project = {
      id: p.id,
      title: p.title,
      description: p.description,
      type: p.type,
      category: p.category,
      version: p.version,
      price: parseFloat(p.price),
      fileUrl: p.file_url,
      fileSize: p.file_size,
      screenshots: p.screenshots || [],
      downloads: p.downloads,
      views: p.views,
      rating: parseFloat(p.rating),
      ratingCount: p.rating_count,
      userRating,
      contact: p.contact,
      featured: p.featured,
      createdAt: p.created_at,
      author: { username: p.author_username, avatar: p.author_avatar },
      comments: commentsResult.rows.map(c => ({ id: c.id, content: c.content, username: c.username, createdAt: c.created_at })),
    };

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.create = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekli' });
    }
    const { title, description, type, category, version, price, contact } = req.body;

    const result = await query(
      `INSERT INTO projects (title, description, type, category, version, price, contact, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [title, description, type, category, version || '1.0.0', price || 0, contact ? JSON.stringify(contact) : '{}', req.user.id]
    );

    const projectId = result.rows[0].id;

    const notificationResult = await query('SELECT id FROM users WHERE id != $1', [req.user.id]);
    for (const user of notificationResult.rows) {
      await query(
        'INSERT INTO notifications (user_id, type, message, data) VALUES ($1, $2, $3, $4)',
        [user.id, 'project', `Yeni proje: ${title}`, JSON.stringify({ projectId })]
      );
    }

    res.status(201).json({ project: { id: projectId, title, description, type, category } });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.update = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekli' });
    }
    const { id } = req.params;
    const { title, description, type, category, version, price, featured, contact } = req.body;

    const result = await query(
      `UPDATE projects SET title = COALESCE($1, title), description = COALESCE($2, description), type = COALESCE($3, type),
       category = COALESCE($4, category), version = COALESCE($5, version), price = COALESCE($6, price),
       featured = COALESCE($7, featured), contact = COALESCE($8, contact), updated_at = NOW()
       WHERE id = $9 RETURNING id`,
      [title, description, type, category, version, price, featured, contact ? JSON.stringify(contact) : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Proje bulunamadı' });
    }

    res.json({ message: 'Proje güncellendi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.delete = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekli' });
    }
    const { id } = req.params;
    const result = await query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Proje bulunamadı' });
    }
    res.json({ message: 'Proje silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekli' });
    }
    if (!req.file) return res.status(400).json({ message: 'Dosya gerekli' });
    const { id } = req.params;
    const fileUrl = `/uploads/${req.file.path.split('uploads')[1]}`.replace(/\\/g, '/');
    const fileSize = req.file.size;

    await query('UPDATE projects SET file_url = $1, file_size = $2 WHERE id = $3', [fileUrl, fileSize, id]);
    res.json({ message: 'Dosya yüklendi', fileUrl, fileSize });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.uploadScreenshot = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekli' });
    }
    if (!req.file) return res.status(400).json({ message: 'Dosya gerekli' });
    const { id } = req.params;
    const screenshotUrl = `/uploads/images/${req.file.filename}`;

    const result = await query('SELECT screenshots FROM projects WHERE id = $1', [id]);
    const screenshots = result.rows[0]?.screenshots || [];
    screenshots.push(screenshotUrl);

    await query('UPDATE projects SET screenshots = $1 WHERE id = $2', [screenshots, id]);
    res.json({ message: 'Ekran görüntüsü yüklendi', url: screenshotUrl });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const result = await query(
      'INSERT INTO project_comments (project_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, content, created_at',
      [id, req.user.id, content]
    );

    res.status(201).json({
      comment: {
        id: result.rows[0].id,
        content: result.rows[0].content,
        username: req.user.username,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.rate = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Puan 1-5 arasında olmalıdır' });
    }

    await query(
      'INSERT INTO project_ratings (project_id, user_id, rating) VALUES ($1, $2, $3) ON CONFLICT (project_id, user_id) DO UPDATE SET rating = $3',
      [id, req.user.id, rating]
    );

    const avgResult = await query('SELECT AVG(rating) as avg, COUNT(*) as count FROM project_ratings WHERE project_id = $1', [id]);
    const avg = parseFloat(avgResult.rows[0].avg).toFixed(2);
    const count = parseInt(avgResult.rows[0].count);

    await query('UPDATE projects SET rating = $1, rating_count = $2 WHERE id = $3', [avg, count, id]);

    res.json({ rating: parseFloat(avg), count });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.search = async (req, res) => {
  try {
    const { q, category, limit = 20 } = req.query;
    let sql = 'SELECT p.*, u.username AS author_username FROM projects p JOIN users u ON p.user_id = u.id WHERE 1=1';
    const params = [];

    if (q) {
      params.push(`%${q}%`);
      sql += ` AND (p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }

    if (category && category !== 'all') {
      params.push(category);
      sql += ` AND p.category = $${params.length}`;
    }

    sql += ' ORDER BY p.created_at DESC';
    params.push(parseInt(limit));
    sql += ` LIMIT $${params.length}`;

    const result = await query(sql, params);
    res.json({ projects: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const result = await query(
      'SELECT p.*, u.username AS author_username FROM projects p JOIN users u ON p.user_id = u.id WHERE p.category = $1 ORDER BY p.created_at DESC',
      [category]
    );
    res.json({ projects: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

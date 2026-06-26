const { query } = require('../config/database');

exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await query(
      `SELECT u.id, u.username, u.avatar, u.bio, u.role, u.badges, u.social_links, u.followers_count, u.following_count, u.email_verified, u.created_at,
       COALESCE((SELECT COUNT(*) FROM projects WHERE user_id = u.id), 0) AS project_count
       FROM users u WHERE u.username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const user = result.rows[0];

    const projectsResult = await query(
      'SELECT id, title, type, downloads, rating, created_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    );
    user.projects = projectsResult.rows;

    if (req.user) {
      const followResult = await query('SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2', [req.user.id, user.id]);
      user.isFollowing = followResult.rows.length > 0;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { bio, social_links } = req.body;
    const result = await query(
      'UPDATE users SET bio = COALESCE($1, bio), social_links = COALESCE($2, social_links), updated_at = NOW() WHERE id = $3 RETURNING id, username, avatar, bio, role, social_links, badges',
      [bio, social_links ? JSON.stringify(social_links) : null, req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Dosya gerekli' });
    }
    const avatarUrl = `/uploads/images/${req.file.filename}`;
    const result = await query('UPDATE users SET avatar = $1 WHERE id = $2 RETURNING id, avatar', [avatarUrl, req.user.id]);
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.follow = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Kendinizi takip edemezsiniz' });
    }

    await query('INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, userId]);
    await query('UPDATE users SET followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = $1) WHERE id = $1', [userId]);
    await query('UPDATE users SET following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = $1) WHERE id = $1', [req.user.id]);

    res.json({ message: 'Takip ediliyor' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.unfollow = async (req, res) => {
  try {
    const { userId } = req.params;
    await query('DELETE FROM follows WHERE follower_id = $1 AND following_id = $2', [req.user.id, userId]);
    await query('UPDATE users SET followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = $1) WHERE id = $1', [userId]);
    await query('UPDATE users SET following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = $1) WHERE id = $1', [req.user.id]);

    res.json({ message: 'Takipten çıkıldı' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [] });

    const result = await query(
      'SELECT id, username, avatar, bio FROM users WHERE username ILIKE $1 LIMIT 20',
      [`%${q}%`]
    );
    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

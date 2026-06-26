const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/search', userController.search);
router.get('/:username', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, () => userController.getProfile(req, res));
  }
  userController.getProfile(req, res);
});
router.put('/profile', authenticate, userController.updateProfile);
router.post('/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);
router.post('/follow/:userId', authenticate, userController.follow);
router.delete('/follow/:userId', authenticate, userController.unfollow);

module.exports = router;

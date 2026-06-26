const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', projectController.getAll);
router.get('/search', projectController.search);
router.get('/category/:category', projectController.getByCategory);
router.get('/:id', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, () => projectController.getOne(req, res));
  }
  projectController.getOne(req, res);
});
router.post('/', authenticate, adminOnly, projectController.create);
router.put('/:id', authenticate, adminOnly, projectController.update);
router.delete('/:id', authenticate, adminOnly, projectController.delete);
router.post('/:id/file', authenticate, adminOnly, upload.single('file'), projectController.uploadFile);
router.post('/:id/screenshots', authenticate, adminOnly, upload.single('screenshot'), projectController.uploadScreenshot);
router.post('/:id/comments', authenticate, projectController.addComment);
router.post('/:id/rate', authenticate, projectController.rate);

module.exports = router;

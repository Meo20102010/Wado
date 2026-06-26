const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate, adminOnly);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.post('/users/:id/ban', adminController.banUser);
router.post('/users/:id/unban', adminController.unbanUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
router.get('/ads', adminController.getAds);
router.post('/ads', adminController.createAd);
router.put('/ads/:id', adminController.updateAd);
router.delete('/ads/:id', adminController.deleteAd);
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.post('/logo', upload.single('logo'), adminController.uploadLogo);
router.get('/chat', adminController.getChatMessages);
router.delete('/chat/:id', adminController.deleteChatMessage);
router.get('/reports', adminController.getReports);

module.exports = router;

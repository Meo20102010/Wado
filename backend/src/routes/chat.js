const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.get('/messages', chatController.getMessages);
router.post('/messages', authenticate, chatController.sendMessage);
router.delete('/messages/:id', authenticate, chatController.deleteMessage);

module.exports = router;

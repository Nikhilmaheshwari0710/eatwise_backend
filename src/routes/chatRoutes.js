const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, getSessions } = require('../controllers/chatController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.post('/message', sendMessage);
router.get('/sessions', getSessions);
router.get('/sessions/:sessionId', getChatHistory);

module.exports = router;

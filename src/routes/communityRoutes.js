const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPost, addReply, toggleLike } = require('../controllers/communityController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.route('/').get(getPosts).post(createPost);
router.route('/:id').get(getPost);
router.post('/:id/reply', addReply);
router.put('/:id/like', toggleLike);

module.exports = router;

const express = require('express');
const router = express.Router();
const { addChild, updateChild, deleteChild, getChildren } = require('../controllers/childController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.route('/').get(getChildren).post(addChild);
router.route('/:childId').put(updateChild).delete(deleteChild);

module.exports = router;

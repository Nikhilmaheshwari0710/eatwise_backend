const express = require('express');
const router = express.Router();
const { scanBarcode, analyzeLabelImage, getProduct, searchProducts, getScanHistory } = require('../controllers/productController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.get('/search', searchProducts);
router.get('/scan/:barcode', scanBarcode);
router.post('/analyze-label', analyzeLabelImage);
router.get('/history', getScanHistory);
router.get('/:id', getProduct);

module.exports = router;

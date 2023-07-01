const router = require('express').Router();
const bookController = require('../controllers/BookController');

router.get('/trending', bookController.getTrendingBook);
router.post('/search', bookController.searchByTitle);
router.get('/categories', bookController.getCategories);
router.get('/publishers', bookController.getPublishers);
router.post('/searchAdvance', bookController.searchBookAdvance);
router.get('/getAll', bookController.getAll);
router.post('/getDetailBook', bookController.getDetailBook);
router.post('/searchByCategory', bookController.searchByCategory);
module.exports = router;

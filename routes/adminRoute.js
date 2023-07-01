const router = require('express').Router();
const adminController = require('../controllers/AdminController');
const auth=require('../middleware/auth')

const storage = require('../middleware/storage');



router.post('/addBook',auth,storage, adminController.addBook);
router.get('/getUsers', auth,adminController.getUsers);
router.get('/listbook', auth,adminController.getAll);
router.post('/deleteUser', auth,adminController.deleteUser);
router.post('/updateUser', auth,adminController.updateUser);
router.post('/createUser', auth,adminController.createUser);
router.get('/getAll', auth,adminController.getAll);
router.post('/deleteBook', auth,adminController.deleteBook);
router.get('/getAuthors', auth,adminController.getAuthors);
router.get('/getAuthors', auth,adminController.getAuthors);
router.get('/getOrders', auth,adminController.getOrders);
router.post('/cancelOrder', auth,adminController.cancelOrder);
router.post('/updateStatus', auth,adminController.updateStatus);


module.exports = router;

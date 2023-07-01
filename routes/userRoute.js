const router = require('express').Router();
const userController = require('../controllers/UserController');
const auth=require('../middleware/auth')
const storage = require('../middleware/storage');

router.post('/orders', auth,userController.orders);
router.get('/purchase',auth,userController.getPurchase);
router.post('/cancel',auth,userController.cancelOrder);

//update user
// delete user
// get a user

module.exports = router;

const authRoute = require('./authRoute');
const bookRoute = require('./bookRoute');
const userRoute = require('./userRoute');
const adminRoute = require('./adminRoute');
const router = require('express').Router();


router.use('/auth', authRoute);
router.use('/book', bookRoute);
router.use('/user', userRoute);
router.use('/admin', adminRoute);
module.exports =router;
// function route(app){
//     app.use('/auth', authRoute);
//     app.use('/book', bookRoute);
// }

// routes/adminRoutes.js

const router = require('express').Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', authController.adminLogin);

router.use(authMiddleware.verifyAdminToken); 

router.get('/users', userController.getUsers); 
router.post('/adjust_balance/:userId', userController.adjustBalance); 
router.post('/grant_tool/:userId', userController.toggleToolAccess); 
router.post('/revoke_tool/:userId', userController.toggleToolAccess); 

module.exports = router;

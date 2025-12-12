// routes/gameRoutes.js

const router = require('express').Router();
const gameController = require('../controllers/gameController');
const userAuth = require('../middlewares/userAuth'); 

router.use(userAuth.verifyUserToken); // Giả định đã tạo middleware userAuth

router.post('/place_bet', gameController.placeBet); 
router.post('/cashout', gameController.cashout); 
router.get('/current_round', gameController.getCurrentRoundInfo); 

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const checkAuth = require('../middleware/checkAuth');

router.post('/register', userController.createNewUser)
// router.delete('/deleteUser', userController.deleteUser)
// router.get('/getUserInfo', userController.getInfo)

module.exports = router;
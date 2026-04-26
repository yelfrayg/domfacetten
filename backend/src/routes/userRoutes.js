const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.createNewUser)
router.put('/updateUserInfo/:id', userController.updateUserInfo)
router.get('/getUserInfo/:id', userController.getUserData)
router.delete('/deleteUser/:id', userController.deleteUser)
router.post('/login', userController.loginUser)

module.exports = router;
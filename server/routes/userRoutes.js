const auth = require('../utils/auth')

const express =  require('express')

const router = new express.Router()

const userController = require('../controllers/userController');

router.get('/user', auth, async(req,res) => {
    res.send(req.user)
});

router.post('/signup', userController.signUp)

router.post('/login', userController.logIn)

router.get('/login', userController.logInPage)

router.get('/logout', userController.logOut)

module.exports = router
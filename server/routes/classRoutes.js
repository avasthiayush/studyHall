const auth = require('../utils/auth')

const express =  require('express')

const router = new express.Router()

const classController = require('../controllers/classController')

router.post('/class', auth, classController.createClass)

router.post('/class/:id/remove', auth, classController.dismissStudents)

router.get('/class/join', auth, classController.joinClass)

router.get('/class/:id/leave', auth, classController.leaveClass)

router.get('/class', auth, classController.rooms)

router.get('/class/:id', auth, classController.class)

module.exports = router
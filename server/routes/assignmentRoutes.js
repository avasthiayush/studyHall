const express =  require('express')

const router = new express.Router()

const multer = require('multer')

const upload = multer().single('filename')

const auth = require('../utils/auth')

const assignmentController = require('../controllers/assignmentController')

router.post('/class/:id/assignment', auth, upload, assignmentController.createTask)

router.post('/class/:id/assignment/:assignment_id/submit', auth, upload, assignmentController.submitTask)

router.get('/class/:id/assignment/:assignment_id/view', auth, assignmentController.taskDisplay)

router.get('/class/:id/assignment/create', auth, assignmentController.createTaskPage)

router.get('/class/:id/assignment/:assignment_id/delete_submission', auth, assignmentController.deleteSubmission)

router.get('/class/:id/assignment/:assignment_id/delete_assignment', auth, assignmentController.deleteTask)

router.get('/class/:id/assignment/:assignment_id/user/:user_id', auth, assignmentController.submissionDisplay)

router.get('/class/:id/assignment/:assignment_id/analysis', auth, assignmentController.userAnalysis)

router.post('/grade/:submission_id', auth, assignmentController.gradeSubmission)

module.exports = router
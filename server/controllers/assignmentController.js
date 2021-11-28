const Assignment = require("../models/assignmentModel");
const Class = require("../models/classModel");
const File = require("../models/fileModel");
const Submission = require("../models/submissionModel");
const User = require("../models/userModel");

// router.post('class/:id/assignment', auth, assignmentController.createAssignment);

module.exports.createTask = async (req,res) => {

  try {

    const user_id = req.user._id
    const classId = req.params.id
    const current_class = await Class.findById(classId)

    if(!current_class)
      throw Error("Invalid Class Id")

    if(user_id.toString() != current_class.teacher.toString())
      throw Error("User is not the owner of class")

    const file = new File({
      file: req.file.buffer,
      owner: user_id,
      class: classId
    })

    await file.save()

    const assignment = new Assignment({
      ...req.body,
      class:classId,
      assignment: file._id
    })

    await assignment.save()

    await file.update( { assignment : assignment._id })
    res.redirect('/class/'+classId)

  } catch (e) {

    res.render('error')

  }
};

module.exports.createTaskPage = async (req,res) => {

  try {

    const user_id = req.user._id
    const classId = req.params.id
    const current_class = await Class.findById(classId)

    if(!current_class)
      throw Error("Invalid Class Id")

    if(user_id.toString() != current_class.teacher.toString())
      throw Error("User is not the owner of class")

    res.render('createtask' , { classId : classId, className: current_class.name , teacherName : req.user.name })

  } catch (e) {

    res.render('error')

  }
};

module.exports.submitTask = async (req,res) => {

  try {

    const user_id = req.user._id
    const classId = req.params.id
    const assignmentId = req.params.assignment_id
    const current_class = await Class.findById(classId)

    if(!current_class)
    throw Error("Invalid Class Id")

    if(!current_class.students || !current_class.students.includes(user_id))
    throw Error("Not a member"); 

    const file = new File({
      file: req.file.buffer,
      owner: user_id,
      class: classId,
      assignment : assignmentId
    })

    await file.save()

    const submission = new Submission({
      owner_student: user_id,
      owner_assignment: assignmentId,
      class: classId,
      submission: file._id
    })
    
    await submission.save()


    res.redirect('/class/' + classId + '/assignment/' + assignmentId + '/view?teacher=false')

  } catch (e) {
      
    res.render('error')

  }
};

module.exports.deleteSubmission = async (req,res) => {

  try {

    const user_id = req.user._id
    const classId = req.params.id
    const assignmentId = req.params.assignment_id
    const current_class = await Class.findById(classId)

    if(!current_class)
    throw Error("Invalid Class Id")

    if(!current_class.students || !current_class.students.includes(user_id))
    throw Error("Not a member");

    const submission = await Submission.findOne({owner_student : user_id, owner_assignment :assignmentId })
    
    await File.findByIdAndDelete(submission.submission)
    await submission.remove()
    
    res.redirect('/class/' + classId + '/assignment/' + assignmentId + '/view?teacher=false')

  } catch (e) {
      
    res.render('error')

  }
};

module.exports.deleteTask = async (req,res) => {

  try {

    const user_id = req.user._id
    const classId = req.params.id
    const assignmentId = req.params.assignment_id
    const current_class = await Class.findById(classId)
    const assignment = await Assignment.findById(assignmentId)

    if(!current_class)
    throw Error("Invalid Class Id")

    if(!assignment)
    throw Error("Invalid Assignment Id")

    if(current_class.teacher.toString() != user_id.toString())
    throw Error("Not the owner");

    await File.deleteMany({assignment : assignmentId})
    await Submission.deleteMany({ owner_assignment: assignmentId })
    await assignment.remove()

    res.redirect('/class/' + classId)

  } catch (e) {
    res.render('error')

  }
};

module.exports.taskDisplay = async (req,res) => {

  try {
    
    const user_id = req.user._id
    const classId = req.params.id
    const assignmentId = req.params.assignment_id
    const isTeacher = req.query.teacher == "true"
    const assignment = await Assignment.findById(assignmentId)
    const current_class = await Class.findById(classId)

    if(!current_class)
    throw Error("Invalid Class Id")

    if(!assignment)
    throw Error("Invalid Assignment Id")

    if(!isTeacher && (!current_class.students || !current_class.students.includes(user_id)))
    throw Error("Not a member"); 
    
    const assignedFile  = await File.findById(assignment.assignment)
    const teacherData = await User.findById(current_class.teacher)
                              .select('name')
                          
    const assignment_data = {
      title: assignment.title,
      description: assignment.description,
      assignedPdf: assignedFile.file,
      className : current_class.name,
      teacherName : teacherData.name,
      assignmentId : assignmentId,
      classId : classId,
      userId : user_id
    }


    const submissions = await Submission.find({
      class: classId,
      owner_assignment: assignment._id
    }).select("owner_student grade")

    if(isTeacher) {
      
      const studentIds = submissions.map( (student, index) => {
          return student.owner_student
      })
      
      const students_name = await User.find({ _id: { $in: studentIds }
                                    }).select("name")                              
      
      const studentMap = new Map()
      
      for(var i=0; i<students_name.length;i++)
          studentMap.set(students_name[i]._id.toString() , students_name[i].name)
      
      const students = []

      for(var i=0; i<submissions.length;i++){
         students.push({
           id: submissions[i].owner_student,
           name: studentMap.get(submissions[i].owner_student.toString()),
           grade: submissions[i].grade
         })
      }

      assignment_data.student = students

    } else {
      
      const submission = await Submission.findOne({
        owner_student: user_id,
        owner_assignment: assignment._id
      })

      if(submission){
        const submissionFile  = await File.findById(submission.submission)
        assignment_data.submittedPdf = submissionFile.file
        assignment_data.grade = submission.grade
      }

      const grades = []
      for(var i=0; i<submissions.length; i++)
        if(submissions[i].grade >= 0)
          grades.push(submissions[i].grade)
        
      grades.sort()

      const submittedStudents = submissions.length
      const gradedStudents = grades.length
      const totalStudents = current_class.students.length

      assignment_data.median = gradedStudents ? grades[parseInt(gradedStudents/2)] : 0
      assignment_data.average = grades.length ? grades.reduce((a,v,i)=>(a*i+v)/(i+1)) : 0
      assignment_data.percentage = totalStudents ? Math.round((submittedStudents / totalStudents) * 100) : 0 
    }

    const assignmentPage = isTeacher ? 'viewTaskTeacher' : 'viewTaskStudent';
    
    res.render(assignmentPage ,{assignment_data : assignment_data})
    

  } catch (e) {
      
    res.render('error')

  }
};


module.exports.submissionDisplay = async (req,res) => {

  try {
    
    const user_id = req.user._id
    const classId = req.params.id
    const assignmentId = req.params.assignment_id
    const studentId = req.params.user_id
    
    const submission = await Submission.findOne({owner_student:studentId , owner_assignment: assignmentId});
    const current_class = await Class.findById(classId)

    if(!current_class)
    throw Error("Invalid Class Id")

    if(!submission)
    throw Error("Invalid SubmissionId")

    const submittedFile  = await File.findById(submission.submission)
                          
    const submission_data = {
      submissionPdf: submittedFile.file,
      submissionId: submission._id,
      isTeacher : (studentId.toString() != user_id.toString())
    }

    res.render( 'viewSubmission' ,{submission_data : submission_data})

  } catch (e) {
      
    res.render('error')

  }
};


module.exports.gradeSubmission = async (req,res) => {

  try {
    
    const submissionId = req.params.submission_id
    const grade = req.body.grade
    
    if(!grade)
      throw Error("Invalid Data")

    const submission = await Submission.findByIdAndUpdate(submissionId , {grade : grade});


    res.redirect('/class/' + submission.class + '/assignment/' + submission.owner_assignment + '/view?teacher=true')

  } catch (e) {
      
    res.render('error')

  }
};


module.exports.userAnalysis = async (req,res) => {

  try {
    const user_id = req.user._id
    const classId = req.params.id
    const assignmentId = req.params.assignment_id
    const current_class = await Class.findById(classId)

    if(!current_class)
    throw Error("Invalid Class Id")
    
    const submissions = await Submission.find({
      class: classId,
      owner_assignment: assignmentId
    }).select("grade") 

    const grades = [0,0,0,0,0]

    const data = {
      not_submitted : current_class.students.length - submissions.length,
      submitted_not_graded : 0,
      submitted_graded : 0
    }

    for(var i=0; i<submissions.length; i++)
      if( submissions[i].grade >= 0 ) {
        grades[parseInt( (submissions[i].grade - 1 ) / 20)] += 1
        data.submitted_graded += 1
      } else 
        data.submitted_not_graded += 1


    res.render('review' , {grades : grades, data : data} )
  } catch (e) {

    res.render('error')

  }

}
const Assignment = require("../models/assignmentModel");
const User = require("../models/userModel");
const Class = require("../models/classModel");
const File = require("../models/fileModel");
const Submission = require("../models/submissionModel");

const generateUniqueId = require('generate-unique-id');
// router.post('/class/create', auth, classController.createClass);

module.exports.createClass = async (req,res) => {

  try {
    
    if(req.user.role === "Student")
      throw Error("Student can't create a class")

    const new_class = new Class({
      ...req.body,
      teacher : req.user._id
    })

    new_class.classCode = generateUniqueId({
      length: 7
    });
    
    await new_class.save()
   
    res.redirect('/class')

  } catch (e) {
      
    res.render('error')

  }
};

module.exports.joinClass = async (req,res) => {

  try {
    const user_id = req.user._id;
    const classCode = req.query.classCode;
    const current_class = await Class.findOne({classCode: classCode})
    
    if(!current_class)
    throw Error("Invalid Class Id")

    if(user_id.toString() === current_class.teacher.toString())
      return res.redirect('/class')

    if(current_class.students && current_class.students.includes(user_id))
      return res.redirect('/class')
    
    await current_class.increaseMember(user_id);
    await req.user.increaseClass(current_class._id);
    
    res.redirect('/class')

  } catch (e) {
      
    res.render('error')

  }
};

module.exports.leaveClass = async (req,res) => {

  try{
 
    const user_id = req.user._id;
    const classId = req.params.id;
    const current_class = await Class.findById(classId)

    if(!current_class)
      throw Error("Invalid Class Id")

    if(!current_class.students || !current_class.students.includes(user_id))
    throw Error("Not a member"); 

    await File.deleteMany({owner: user_id, class: classId})
    await Submission.deleteMany({owner_student: user_id, class: classId})
    
    await current_class.decreaseMember(user_id);
    await req.user.decreaseClass(classId);
    
    res.redirect('/class')

  } catch(e) {

    res.render('error')

  }
} 

module.exports.rooms = async (req, res) => {

  try {

    const classes = await Class
                      .find(( { $or: [ { teacher : req.user._id } , { _id: { $in: req.user.member_classes } } ] } ))
                      .sort({teacher: 'desc'})
                      .select("name teacher")

    const teacherIds = classes.map( (e) => {
      return e.teacher
    })
    
    const teacherData = await User.find({ _id : { $in : teacherIds}})
                                  .select('name')
    
    const teacherMap = new Map()
    const classData = []  
    
    for(var i=0; i<teacherData.length; i++)
      teacherMap.set( teacherData[i]._id.toString() , teacherData[i].name )
    
    for(var i=0; i<classes.length; i++) {
      classData.push({
        id : classes[i]._id,
        name : classes[i].name,
        teacher : teacherMap.get(classes[i].teacher.toString())
      })
    }
    
    res.render('rooms',{ classes:classData, role: req.user.role })

  } catch(e) {

    res.render('error')

  }
}

// router.get('/class/:id', auth, classController.class);
module.exports.class = async (req, res) => {

  try {
    
    const current_class = await Class.findById(req.params.id)
    
    if(!current_class)
      throw Error("Invalid Class Id")
    
    if(current_class.teacher.toString() != req.user._id.toString()
      && (!current_class.students || !current_class.students.includes(req.user._id)))
      throw Error("Not a member"); 

    const teacher = await User.findById(current_class.teacher)
                           .select("name -_id")

    const students = await User.find( { _id: { $in: current_class.students } } )
                               .select("name")

    await current_class
      .populate({
        path: "assignments",
      });

    const class_data = {
      name : current_class.name,
      classCode : current_class.classCode,
      classId : req.params.id,
      teacher: teacher.name,
      teacher_id : current_class.teacher,
      students_list : students,
      assignments : current_class.assignments
    }
    res.render('tasks',{ class_data:class_data , user_id: req.user._id })
  } catch(e) {

    res.render('error')
  }
}


module.exports.dismissStudents = async ( req, res ) => {

    try {
      
      const classId = req.params.id
      var students_list = []
      const current_class = await Class.findById(classId)

      if( (typeof req.body._id) === typeof "string" )
        students_list.push( req.body._id )
      else 
        students_list = req.body._id

      await File.deleteMany(( { $and: [ { owner : { $in: students_list}}   , {class : classId}] } )  )
      await Submission.deleteMany(( { $and: [ { owner_student : { $in: students_list}}   , {class : classId}] } ))
      
      const studentsIdSet = new Set(students_list)


      const aux = current_class.students.filter((value) => !studentsIdSet.has(value.toString()))
      current_class.students = aux
      
      await current_class.save()

      for(var i=0; i<students_list.length ;i++) {
        const student = await User.findById(students_list[i])
        student.member_classes = student.member_classes.filter((value) => value.toString() != classId.toString() )
        await student.save()
      }

      res.redirect('/class/' + classId)

    } catch (e) {
      res.render('error')
    }
}
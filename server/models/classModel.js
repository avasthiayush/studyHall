const mongoose = require('mongoose')

const classSchema = new mongoose.Schema({
    teacher : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },

    name : {
      type : String,
      required : true
    },

    classCode : {
      type : String,
      required : true,
      unique: true
    },

    students : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }]

} , {
    timestamps : true
})

classSchema.virtual('assignments' , {
  ref : 'Assignment' ,
  localField : '_id' ,
  foreignField : 'class'
})

classSchema.methods.increaseMember = async function ( user_id ) {
  this.students.push(user_id)
  await this.save()
}

classSchema.methods.decreaseMember = async function ( user_id ) {
  this.students.remove(user_id)
  await this.save()
}

const Class = mongoose.model( 'Class' , classSchema )

module.exports = Class
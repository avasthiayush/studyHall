const mongoose = require('mongoose')

const assignmentSchema = new mongoose.Schema({
    class : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Class',
        required : true
    },

    title : {
      type : String
    },

    description : {
      type : String
    },

    assignment : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'File',
      required : true
    }

} , {
    timestamps : true
})

assignmentSchema.virtual('submissions' , {
  ref : 'Submission' ,
  localField : '_id' ,
  foreignField : 'owner_assignment'
})

const Assignment = mongoose.model( 'Assignment' , assignmentSchema )

module.exports = Assignment
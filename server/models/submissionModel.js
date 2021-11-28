const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema({
    owner_student : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },

    owner_assignment : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Assignment',
      required : true
    },
    
    class : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Class',
      required : true
    },

    submission : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'File',
      required : true
    },

    grade : {
      type : Number,
      required : true,
      default: -1
    },

} , {
    timestamps : true
})

const Submission = mongoose.model( 'Submission' , submissionSchema )

module.exports = Submission
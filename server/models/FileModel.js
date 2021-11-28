const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
    file : {
      type : Buffer
    },

    owner : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'User',
      required : true
    },
     
    class : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Class',
      required : true
    },
    
    assignment : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Assignment'
    }
} , {
    timestamps : true
})

const File = mongoose.model( 'File' , fileSchema )

module.exports = File
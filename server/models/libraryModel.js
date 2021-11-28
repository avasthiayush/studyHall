const mongoose = require('mongoose')

const librarySchema = new mongoose.Schema({
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },

    tag : {
      type : String
    },

    name : {
      type : String
    },

    file : {
      type : String
    },

} , {
    timestamps : true
})

const Library = mongoose.model( 'Library' , librarySchema )

module.exports = Library
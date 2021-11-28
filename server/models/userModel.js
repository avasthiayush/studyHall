const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name :{
      type : String
    },

    email: {
      type: String,
      required:true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
          if (!validator.isEmail(value)) {
              throw new Error('Email is invalid')
          }
      }
    },

    password: {
      type: String,
      required:true,
      trim: true
    },

    role: {
      type: String,
      required: true,
      default: 'Student'
    },

    member_classes : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Class'
    }]
});

userSchema.virtual('classes' , {
    ref : 'Class' ,
    localField : '_id' ,
    foreignField : 'teacher'
})

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user)  throw new Error('Either email or password is incorrect')
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new Error('Either email or password is incorrect')
    return user
}

userSchema.pre('save' , async function(next){
    if(this.isModified('password')) this.password = await bcrypt.hash(this.password,8)
    next()
})

userSchema.methods.increaseClass = async function ( class_id ) {
  this.member_classes.push(class_id)
  await this.save()
}

userSchema.methods.decreaseClass = async function ( class_id ) {
  this.member_classes.remove(class_id)
  await this.save()
}

const User =  mongoose.model('User',userSchema)

module.exports = User
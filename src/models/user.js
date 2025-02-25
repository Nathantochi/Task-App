const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        require : true,
        trim : true
    } , 
    email : {
        type : String,
        unique : true,
        require : true,
        trim : true,
        lowercase : true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error ('Invalid Email')
            }
        }
    },
    password : {
        type : String,
        require : true,
        trim : true,
        minlength : 7,
        validate (value)  {
            
            if (typeof value !== 'string') {
                throw new Error('Password must be a string');
            }
            if (value.toLowerCase().includes('password')) {
                throw new Error('Invalid password');
            }
    
        }
    },
    age : {
        type : Number,
        default : 18,
        validate (value){
            if (value < 17) {
                throw new Error('Must be an Adult')
            }
        }
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }], 
    avatar : {
        type : Buffer
    }
}, 
{
    timestamps : true  
})

userSchema.virtual('myTasks', {
    ref : 'Task',
    localField : '_id',
    foreignField : 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject() 

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function (){
    const user = this
    const token = jwt.sign({_id : user.id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token 
}

userSchema.statics.findByCredentials= async (email, password) => {
    const user = await User.findOne({email})

    if (!user){
        throw new Error ('Unable to Login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error ('Unable to Login')
    }

    return user
}

userSchema.pre('save', async function (next){
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    // console.log('Just before saving')

    next()
})

userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner : user._id})

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
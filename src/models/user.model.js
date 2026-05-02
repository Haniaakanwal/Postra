const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "username already exist"],
        required: [true, "username must required"]
    },
    email: {
        type: String,
        unique: [true, "Email already exist"],
        required: [true, "Email must required"]
    },
    password:{
        type:String,
        select:false,
         required: [true, "Password required"]
    },
    bio:String ,
    profilePhoto:{
        type:String,
        default:"https://ik.imagekit.io/hnoglyswo0/avatar-gender-neutral-silhouette-vector-600nw-2470054311.webp"
    },
    followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    }],
     following:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    }],
    
})
const userModel = mongoose.model("User",UserSchema)

module.exports = userModel
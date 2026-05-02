const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    caption:{
        type:String,
        default:''
    },
    imgUrl:{
        type:String,
        required:[true,"Img Url must be required"]
    },
    user:{
        ref:"User",
        type:mongoose.Schema.Types.ObjectId,
        required:[true,"user id  must be required to create post"]
    }
})
const postModel = mongoose.model("post", postSchema)

module.exports = postModel
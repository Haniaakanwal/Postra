const userModel = require("../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const ImageKit = require("@imagekit/nodejs")
const { toFile } = require("@imagekit/nodejs")
const postModel   = require("../models/post.model")    // ← ADD
const followModel = require("../models/follow.model")

const imgkit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
})
// ── add this helper at the top after your imports ──
const cookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production" ? true : false,
    maxAge: 24 * 60 * 60 * 1000
}

const clearCookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production" ? true : false,
}
async function registerController(req, res) {
    const { username, email, password, bio} = req.body
  console.log("req.file →", req.file)        // ← ADD THIS
    console.log("req.body →", req.body)  
    
    const UserExist = await userModel.findOne({
        $or: [{ email }, { username }]
    }).select('+password')

    if (UserExist) {
        return res.status(409).json({
            message: "User already Exist" +
                (UserExist.email = email ?
                    "Email Already exist" : "Username already exist"
                )
        })
    }
    let profilePhotoUrl = undefined
 if (req.file) {
    const uploaded = await imgkit.files.upload({
        file: req.file.buffer.toString("base64"),          // ← directly pass the buffer, no Buffer.from()
        fileName: `profile_${username}`,
        folder: "insta-clone-profiles"
    })
    profilePhotoUrl = uploaded.url
}
 
  
    const hash = await bcrypt.hash(password,10)

    const user = await userModel.create({
        username,
        email,
        password: hash,
        bio,
        profilePhoto : profilePhotoUrl
    })

    const token = jwt.sign({
        id: user._id,
        username: user.username
    }, process.env.jwt_secret, { expiresIn: "1d" })

    res.cookie("token", token, cookieOptions) 

    res.status(201).json({
        message: "Account created successfully",
        user: {
            username: user.username,
            email: user.email,
            bio: user.bio,
            profilePhoto: user.profilePhoto
        }
    })
}

async function loginController (req, res) {
    const { username, email, password } = req.body

    const user = await userModel.findOne({
        $or: [{ email: email }, { username: username }]
    }).select('+password')

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        })
    }

    const ValidPass = await bcrypt.compare(password, user.password)

    if(!ValidPass) {
        return res.status(401).json({
            message: "incorrect Password"
        })
    }
    const token = jwt.sign({
        id: user._id,
          username:user.username
    }, process.env.jwt_secret, { expiresIn: "1d" })

    res.cookie("token", token, cookieOptions) 

    res.status(201).json({
        message: "Login successfully",
        user: {
            username: user.username,
            email: user.email,
            bio:user.bio,
            profilePhoto: user.profilePhoto
        }
    })
}
async function getMeController(req,res) {
    const userId = req.user.id

    const user = await userModel.findById(userId)

    res.status(200).json({
        user:{
                username: user.username,
            email: user.email,
            bio: user.bio,
            profilePhoto: user.profilePhoto
        }
    })
}
async function logoutController(req, res) {
    try {
      res.clearCookie("token", clearCookieOptions)
        res.status(200).json({ message: "Logged out successfully" })
    } catch (err) {
        res.status(500).json({ message: "Logout failed" })
    }
}

async function deleteAccountController(req, res) {
    try {
        const userId = req.user.id
        const username = req.user.username

        // delete user's posts
        await postModel.deleteMany({ user: userId })

        // delete user's follow records
        await followModel.deleteMany({
            $or: [
                { follower: username },
                { followee: username }
            ]
        })

        // delete the user
        await userModel.findByIdAndDelete(userId)

   res.clearCookie("token", clearCookieOptions)

        res.status(200).json({ message: "Account deleted successfully" })

    } catch (err) {
        console.error("Delete account error →", err)
        res.status(500).json({ message: "Failed to delete account" })
    }
}
module.exports = {
    registerController,
    loginController,
    getMeController,
    logoutController,
    deleteAccountController
}
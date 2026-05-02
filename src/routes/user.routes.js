const express = require("express")
const  userController = require("../controllers/user.controller")
const UserRouter = express.Router()
const identifyUser = require('../middlewares/auth.middleware')

UserRouter.post("/follow/:username",identifyUser,userController.followController)

UserRouter.post("/unfollow/:username",identifyUser,userController.unfollowController)
UserRouter.get("/profile", identifyUser,userController.getProfileController)
UserRouter.get("/profile/:username", identifyUser,userController.getUserProfileController)
module.exports = UserRouter
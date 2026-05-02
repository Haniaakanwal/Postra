const express = require("express")
const authRouter = express.Router()
const authController = require('../controllers/auth.controller')
const identifyUser = require("../middlewares/auth.middleware")
const multer = require("multer")
const upload = multer({ storage: multer.memoryStorage() })  

authRouter.post('/register',upload.single("profilePhoto"), authController.registerController 
)


authRouter.post('/login', authController.loginController
)

authRouter.get('/get-me',identifyUser, authController.getMeController
)
authRouter.post('/logout',    identifyUser, authController.logoutController)        // ← ADD
authRouter.delete('/delete',  identifyUser, authController.deleteAccountController) 

module.exports = authRouter
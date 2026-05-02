const express = require("express")
const postRouter = express.Router()
const postController = require('../controllers/post.controller')
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const identifyUser = require("../middlewares/auth.middleware")

postRouter.post('/', upload.single("img"), identifyUser, postController.postController)
postRouter.get('/', identifyUser, postController.getController)
postRouter.get('/details/:postId', identifyUser, postController.getdetailsController)

postRouter.post('/like/:postId',identifyUser,postController.likePostController)
postRouter.post('/unlike/:postId',identifyUser,postController.unlikePostController)
postRouter.get ('/feed', identifyUser, postController.FeedController)


module.exports = postRouter
const postModel = require("../models/post.model")
const ImageKit = require("@imagekit/nodejs");
const { toFile } = require("@imagekit/nodejs");
const likeModel = require("../models/like.model")
const followModel = require("../models/follow.model")
const imgkit = new ImageKit({
  privateKey: process.env["IMAGEKIT_PRIVATE_KEY"],
});

async function postController(req, res) {

  const file = await imgkit.files.upload({
    file: await toFile(Buffer.from(req.file.buffer), "file"),
    fileName: "test",
    folder: 'insta-clone-post'
  });

  const post = await postModel.create({
    caption: req.body.caption,
    imgUrl: file.url,
    user: req.user.id
  })

  res.status(201).json({
    message: "Post Created Sucessfully",
    post
  })
}

async function getController(req, res) {

  const userId = req.user.id

  const post = await postModel.find({ user: userId })

  res.status(200).json({
    message: "Post Fetch successfully",
    post
  })
}

async function getdetailsController(req, res) {

  const userId = req.user.id
  const postid = req.params.postId
  const post = await postModel.findById(postid)

  if (!post) {
    return res.status(404).json({
      message: "Page not Found"
    })
  }

  const isValid = post.user.toString() === userId

  if (!isValid) {
    return res.status(403).json({
      message: "Forbidden content "
    })
  }

  return res.status(200).json({
    message: "Post fetched successfully",
    post
  })

}

async function likePostController(req, res) {

  const username = req.user.username
  const postId = req.params.postId

  const post = await postModel.findById(postId)
  if (!post) {
    return res.status(404).json({
      message: "post not found"
    })
  }
  const like = await likeModel.create({
    post: postId,
    user: username
  })

  return res.status(201).json({
    message: "post like successfully",
    like
  })


}
async function unlikePostController(req, res){
    const username = req.user.username
  const postId = req.params.postId

  const isLiked = await likeModel.findOne({
      post: postId,
    user: username
  })
    if (!isLiked) {
    return res.status(400).json({
      message: "post disliked"
    })
  }
  await likeModel.findOneAndDelete({_id:isLiked._id})

  return res.status(200).json({
    message:"post disLiked Successfully"
  })

}
async function FeedController(req, res) {
  try {
    const user = req.user

    const posts = await postModel
      .find()
      .populate("user")
      .lean()
      .sort({ _id: -1 })

    // get list of usernames the logged-in user follows
    const followingDocs = await followModel.find({ follower: user.username })
    const followingUsernames = followingDocs.map(f => f.followee)

    const feed = await Promise.all(
      posts.map(async (post) => {
        const isLiked = await likeModel.findOne({
          user: user.username,
          post: post._id,
        })
        post.isLiked = !!isLiked

        // add isFollowing flag to each post's user
        if (post.user) {
          post.user.isFollowing = followingUsernames.includes(post.user.username)
          post.isOwnPost = post.user._id.toString() === user.id
        }

        return post
      })
    )

    res.status(200).json({
      message: "Post fetch Successfully",
      posts: feed,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Something went wrong" })
  }
}

module.exports = {
  postController,
  getController,
  getdetailsController,
  likePostController,
  unlikePostController,
  FeedController
};

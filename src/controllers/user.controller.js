const followModel = require("../models/follow.model")
const userModel = require("../models/user.model")
const postModel = require("../models/post.model")

async function followController(req, res) {

    const followerUsername = req.user.username
    const followeeUsername = req.params.username

    if (followeeUsername === followerUsername) {
        return res.status(400).json({
            message: "you cannot follow yourself"
        })
    }

    const FolloweeExist = await followModel.findOne({
        username: followeeUsername
    })
    if (FolloweeExist) {
        return res.status(404).json({
            message: "User doesnot exist"
        })
    }
    const alreadyFollow = await followModel.findOne({
        follower: followerUsername,
        followee: followeeUsername,
    })

    if (alreadyFollow) {
        return res.status(200).json({
            message: "Already follow"
        })
    }
    const followRecord = await followModel.create({
        follower: followerUsername,
        followee: followeeUsername
    })
    res.status(201).json({
        message: `you are now following ${followeeUsername}`,
        follow: followRecord
    })
}
async function unfollowController(req, res) {
    const followerUsername = req.user.username
    const followeeUsername = req.params.username

    const isFollowing = await followModel.findOne({
        follower: followerUsername,
        followee: followeeUsername,
    })

    if (!isFollowing) {
        return res.status(200).json({
            message: `You are not following ${followeeUsername}`
        })
    }
    await followModel.findByIdAndDelete(isFollowing._id)

    res.status(200).json({
        message: `You have unfollowed ${followeeUsername}`
    })

}
async function getProfileController(req, res) {

    try {
        const userId = req.user.id 

        const user = await userModel.findById(userId)

        if (!user) return res.status(404).json({ message: "User not found" })

        const postCount = await postModel.countDocuments({ user: userId })

        // Use follow collection as source of truth (your existing system)
        const followersCount = await followModel.countDocuments({ followee: user.username })
        const followingCount = await followModel.countDocuments({ follower: user.username })

            // Get actual follower/following user details
            const followerDocs = await followModel.find({ followee: user.username }).lean()
            const followingDocs = await followModel.find({ follower: user.username }).lean()
        
            const followerUsernames = followerDocs.map((f) => f.follower)
            const followingUsernames = followingDocs.map((f) => f.followee)

        const followers = await userModel
          .find({ username: { $in: followerUsernames } })
          .select("username profilePhoto bio")
    
        const following = await userModel
          .find({ username: { $in: followingUsernames } })
          .select("username profilePhoto bio")
    
          
              // Fetch user's posts
              const posts = await postModel.find({ user: userId }).sort({ _id: -1 }).lean()
          
              res.status(200).json({
                user: {
                  username: user.username,
                  email: user.email,
                  bio: user.bio,
                  profilePhoto: user.profilePhoto,
                },
                stats: {
                  postCount,
                  followersCount,
                  followingCount,
                },
                followers,
                following,
                posts,
              })
            } catch (err) {
              console.error(err)
              res.status(500).json({ message: "Something went wrong" })
            }

    }
// GET /api/user/profile/:username — view any user's profile
async function getUserProfileController(req, res) {
  try {
    const { username } = req.params
    const viewerUsername = req.user.username

    const user = await userModel.findOne({ username })
    if (!user) return res.status(404).json({ message: "User not found" })

    const postCount = await postModel.countDocuments({ user: user.id })
    const followersCount = await followModel.countDocuments({ followee: username })
    const followingCount = await followModel.countDocuments({ follower: username })

 const isFollowing = !!(await followModel.findOne({
  follower: viewerUsername,     
  followee: username,         
}))

    const posts = await postModel.find({ user: user._id }).sort({ id: -1 }).lean()

    res.status(200).json({
      user: {
        username: user.username,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
      },
      stats: { postCount, followersCount, followingCount },
      isFollowing,
      posts,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Something went wrong" })
  }
}
module.exports = {
    followController,
    unfollowController,
    getProfileController,
    getUserProfileController
}
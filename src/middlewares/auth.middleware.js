const jwt = require('jsonwebtoken')
const multer = require("multer")

const storage = multer.memoryStorage()

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    // only allow image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files allowed"), false)
    }
  }
})

module.exports = upload

async function identifyUser(req,res,next){
      
       
      const token = req.cookies.token
    
      if (!token) {
        return res.status(401).json({
          message: "Token not provided , Unauthorized access"
        })
      }
    
        let decoded = null

        try{
         decoded = jwt.verify(token , process.env.jwt_secret)
        }
        catch(err){
          return res.status(401).json({
            message:"invalid token"
          })
        }
        
        req.user = decoded

        next()
}

module.exports = identifyUser
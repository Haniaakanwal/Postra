const cookieParser = require('cookie-parser')
const express = require('express')
const cors = require('cors')
const path = require("path") 

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true          
}));

const authRouter = require('../src/routes/auth.routes')
const postRouter = require('../src/routes/post.routes')
const UserRouter = require("./routes/user.routes")

app.use('/api/auth', authRouter)
app.use('/api/post', postRouter)
app.use('/api/user', UserRouter)

app.use(express.static(path.join(__dirname, "../dist")))  // ← ADD THIS


app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"))
})
module.exports = app
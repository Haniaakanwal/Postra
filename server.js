require('dotenv').config()
const ConnectDB = require("./src/config/database");
const app = require("./src/app")


ConnectDB()
// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => {
    console.log("running on port 3000");
  });
}

// Export for Vercel (serverless)
module.exports = app;
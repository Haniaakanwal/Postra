require('dotenv').config()
const ConnectDB = require("./src/config/database");
const app = require("./src/app")

const PORT = process.env.PORT || 3000;

ConnectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });
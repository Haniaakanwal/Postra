require('dotenv').config()
const ConnectDB = require("./src/config/database");
const app = require("./src/app")


ConnectDB()
app.listen(3000,()=>{
    console.log('Server running on port 3000');
    
})
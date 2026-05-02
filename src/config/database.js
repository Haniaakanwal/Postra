const mongoose = require('mongoose')

async function ConnectDB() {
    await mongoose.connect(process.env.Mongo_URI)

    console.log('Connected to Database');
    
}

module.exports = ConnectDB
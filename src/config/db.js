const mongoose = require('mongoose');

const connectDb = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    }catch(error){
        console.error('MongoDb connection error :',error.message);
        process.exit(1);  //to stop the app if the DB fails
    }
}

module.exports = connectDb;
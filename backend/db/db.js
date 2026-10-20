import mongoose from "mongoose";

 export default async function connectDB() {
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("DB connected successfully");
        
    }).catch((err)=>{
      console.log(err);
      
    })
}
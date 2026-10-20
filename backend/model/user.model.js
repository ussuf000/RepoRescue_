import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        unique:true,
    }
},
{
    timestamps:true,
}
)

const userModel=await mongoose.model('user',userSchema);

export default userModel;
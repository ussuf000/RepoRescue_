import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:80
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        maxlength:254
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        maxlength:128,
        select:false
    }
},
{
    timestamps:true,
}
)

const userModel=await mongoose.model('user',userSchema);

export default userModel;

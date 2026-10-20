import userModel from "../model/user.model.js";
import bcrypt, { hash } from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function userRegister(req,res) {
    const {username,email,password} = req.body;

    const user= await userModel.findOne({
        email
    })
    if(user){
        return res.status(401).json({
            message:"user is already register"
        })
    }
    
      console.log(req.body);

    const hash=await bcrypt.hash(password,10);
  
    
    console.log(req.body.password);

    const newuser=await userModel.create({
        username,
        password:hash,
        email

    })

    const token=jwt.sign({
        id:newuser._id
    },process.env.JWT_SECRET,{expiresIn:'7d'})

    res.cookie("token",token);

    res.status(201).json({
        message:'register successful',
       user:{
          username:newuser.username,
        password:newuser.password,
        email:newuser.email,
        token

       }
        
       
    })

    
}

export async function userLogin(req,res) {

    const {email,password}= req.body;

    const user=await userModel.findOne({email});

    if(!user){
        return res.status(409).json({
            message:"unauthroize"
        })
    }
    const isvalidpassword=await bcrypt.compare(password,user.password)
    if(!isvalidpassword){
        return res.status(409).json({
            message:"unauthroize"
        })
    }

  const token=  jwt.sign({
        id:user._id
    },process.env.JWT_SECRET)
    
    res.cookie('token',token)

   return  res.status(200).json({
        message:"user login successfully",
        user
    })
    
}

 export async function userLogout(req,res) {

    res.clearCookie('token');

    return res.status(203).json({
        message:"user logout successfully"
    })

    
    
}
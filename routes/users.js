const express=require("express");
const router =express.Router();
const {check,validationResult}=require("express-validator");
const User=require("../models/User");
const bcrypt =require("bcryptjs");
const jwt = require("jsonwebtoken");
const config= require("config");
const {auth} =require("../utils/index");
const Profile = require("../models/Profile");
//this API is public
 router.post("/register",//validation
 check("name","Name is reuired").notEmpty(),
 check("email","Please include a valid email").isEmail(),
 check("password","Pleas choose a password with at least 6 chracters").isLength({min:6}),
 async(req,res)=> {
    const errors =validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const{name,email,password}= req.body;
    try{
        let user= await User.findOne({email});//check if user exist 
        if(user){
            return res.status(400).json({errors:[{msg:"User already exists"}]})
        }
        user=new User({name,email,password});
        //encrypy password
        const salt=await bcrypt.genSalt(10);
        user.password= await bcrypt.hash(password,salt);

        await user.save();
        //create token
        const payload={
            user:{
                id:user.id
            }
        }

        jwt.sign(payload,config.get("jwtSecret"),{expiresIn:"5 day"},(err,token)=>{
            if(err){
                throw err;
            }else{
                res.json({token});
            }
        })
    }catch(err){
        console.error(err);
        res.status(500).send(err);
    }
 });
//this API is public
 router.post("/login",//validation
 check("email","Please include a valid email").isEmail(),
 check("password","Pleas choose a password with at least 6 chracters").isLength({min:6}),
 async(req,res)=> {
    const errors =validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const{email,password}= req.body;
    try{
        let user= await User.findOne({email});//check if user exist 
        if(!user){
            return res.status(400).json({errors:[{msg:"Invalid Credentials"}]});
        }
        const isMatch=await bcrypt.compare(password,user.password) ;//check the password
        if(!isMatch){
            return res.status(400).json({errors:[{msg:"Invalid Credentials"}]});
        }
    
        //create token
        const payload={
            user:{
                id:user.id
            }
        }

        jwt.sign(payload,config.get("jwtSecret"),{expiresIn:"5 day"},(err,token)=>{
            if(err){
                throw err;
            }else{
                res.json({token});
            }
        })
    }catch(err){
        console.error(err);
        res.status(500).send(err);
    }
 });
//this API is private ==> takes a token and returns user information
router.get("/",auth,async (req,res)=>{
  try{
    const user= await User.findById(req.user.id).select("-password");
    res.json(user);
  }catch(err){
    console.log(err.massege);
    res.status(500).send(err.massege);
  } 
}
);
 
 module.exports=router;
const express=require("express");
const router =express.Router();
const {check,validationResult}=require("express-validator");
const User=require("../models/User");
const bcrypt =require("bcryptjs");
const jwt = require("jsonwebtoken");
const config= require("config")
 router.post("/",
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
        let user= await User.findOne({email});
        if(user){
            return res.status(400).json({errors:[{msg:"User already exists"}]})
        }
        user=new User({name,email,password});

        const salt=await bcrypt.genSalt(10);
        user.password= await bcrypt.hash(password,salt);

        await user.save();

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

 module.exports=router;
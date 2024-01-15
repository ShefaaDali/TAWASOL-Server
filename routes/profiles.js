const express = require("express");
const router = express.Router();
const { auth,upload } = require("../utils/index");
const { check, validationResult } = require("express-validator");
const normalize = require("normalize-url");
const Profile =require("../models/Profile");
const User =require("../models/User");


//create and update profile
router.post("/",
            auth,
            check("status","Status is required").notEmpty(),
            check("skills","Skills is required").notEmpty(),
            async (req,res)=>{
            const errors =validationResult(req);
            if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
            const{website,skills,youtube,twitter,instagram,linkdin,facebook,github,...rest}=req.body; //sprid operator
            const profile ={
                user:req.user.id,
                website: website && website  !=="" ?normalize(website,{forceHttps:true}):"",
                skills:Array.isArray(skills)?skills: skills.split(",").map(skill=>skill.trim()),
                ...rest
            };
            const socialFields ={website,skills,youtube,twitter,instagram,linkdin,facebook,github};
            for (let key in socialFields ){
                const value =socialFields[key];
                if(value && value != "") socialFields[key]=normalize(value,{forceHttps:true});
            }
            profile.social=socialFields;
             try{
                let profileObject =await Profile.findOneAndUpdate(
                    {user:req.user.id},
                    {$set:profile}, //$set =>to set the object in the DB
                    {new:true,upsert:true}
                );
                return res.json(profileObject);
             }catch(err){
              console.error(err.message);
              return res.status(500).send(err.message); 
             }
             });

//GET APIs
router.get("/me",auth,async(req,res)=>{
    try{
        const profile =await Profile.findOne({user:req.user.id}).populate("user",["name"]);
        if(!profile) return res.status(400).send("ther is no profile for this user");
        res.json(profile);
    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
})
//find all profile 
router.get("/",auth,async(req,res)=>{
    try{
        const profiles =await Profile.find().populate("user",["name"]);
        res.json(profiles);
    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
})

// get specific user
router.get("/user/:user_id",auth,async(req,res)=>{
    try{
        const profile =await Profile.findOne({user:req.params.user_id}).populate("user",["name"]);
        if(!profile) return res.status(400).send("ther is no profile for the given user")
        res.json(profile);
    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
})

router.delete("/",auth,async(req,res)=>{
    try{
        await Promise.all(
            //delet Posts
            Profile.findByIdAndRemove({user:req.user.id}),
            User.findByIdAndRemove({_id:req.user.id}))
            res.json({msg:"user information is deleted successfully"})
    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
})

//upload image 
router.post("upload",auth,async(req,res)=>{
try{
    upload(req,res,async(err)=>{
        if(err){
            res.status(500).send(`server error: ${err}`)
        } else{
            res.status(200).send(req.user.id)
        }
    })
}catch(err){
    console.error(err.message);
    return res.status(500).send(err.message);
}
})
module.exports = router;

const express = require("express");
const router = express.Router();
const { auth,upload } = require("../utils/index");
const { check, validationResult } = require("express-validator");
const normalize = require("normalize-url");
const Profile =require("../models/Profile");
const User =require("../models/User");
const Post =require("../models/Post");


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
//delete user
router.delete("/",auth,async(req,res)=>{
    try{
        await Promise.all([
            Post.deleteMany({user:req.user.id}),
            Profile.findOneAndDelete({user:req.user.id}),
            User.findByIdAndRemove({_id:req.user.id})])
            res.json({msg:"user information is deleted successfully"})
    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
})

//upload image 
router.post("/upload",auth,async(req,res)=>{
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
});

//add and update experience 
router.put(
    "/experience",
    check("title","Title is required").notEmpty(),
    check("company","company is required").notEmpty(),
    check("from","from date is required and needs to be from ppast") //!!! need to add condition for past dates
    .notEmpty()
    .custom((value,{req})=>{
        return req.body.to? value <req.body.to :true;
    }),auth,
    async(req,res)=>{
        const errors =validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
    const profile = await Profile.findOne({user:req.user.id});
    profile.experience.unshift(req.body);
    await profile.save();
    return res.json(profile);
    }catch(err){
    console.log(err.message);
    res.status(500).send(err.massege);    
    }
    });
 //delete experience 
 router.delete("/experience/:exp_id",auth,async (req,res)=>{
    try{
        const profile =await Profile.findOne({user:req.user.id});
        profile.experience =profile.experience.filter(exp=>{
            return exp._id.toString !== req.params.exp_id;
        });
        await profile.save();
        return res.json(profile);
    }catch(err){
        console.log(err.massege);
        res.status(500).send(err.massege);    
        }
 });

 //add and update education 
router.put(
    "/education",
    check("school","school is required").notEmpty(),
    check("degree","degree is required").notEmpty(),
    check("fieldofstudy","field of study is required").notEmpty(),
    check("from","from date is required and needs to be from ppast") //!!! need to add condition for past dates
    .notEmpty()
    .custom((value,{req})=>{
        return req.body.to? value <req.body.to :true;
    }),auth,
    async(req,res)=>{
        const errors =validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
    const profile = await Profile.findOne({user:req.user.id});
    profile.education.unshift(req.body);
    console.log(profile.education)
    await profile.save();
    return res.json(profile);
    }catch(err){
    console.log(err.massege);
    res.status(500).send(err.massege);    
    }
    });
 //delete education
 router.delete("/education/:edu_id",auth,async (req,res)=>{
    try{
        const profile =await Profile.findOne({user:req.user.id});
        profile.education =profile.education.filter(edu=>{
            return edu._id.toString !== req.params.edu_id;
        });
        await profile.save();
        return res.json(profile);
    }catch(err){
        console.log(err.massege);
        res.status(500).send(err.massege);    
        }
 });
module.exports = router;

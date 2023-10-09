const express = require("express");
const router = express.Router();
const { auth } = require("../utils/index");
const { check, validationResult } = require("express-validator");
const normalize = require("normalize-url");
const Profile =require("../models/Profile");

//create and update profile
router.post("/",
            auth,
            check("status","Status is required").notEmpty(),
            check("skills","Skills is required").notEmpty(),
            async (req,res)=>{
            const errors =validationResult(req);
            if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
            const{website,skills,youtube,twitter,instagram,linkdin,facebook,github,...rest}=req.body; //sprid operator
            console.log(rest);
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


module.exports = router;

const express=require("express");
const router =express.Router();
const {auth} =require("../utils");
const {check, validationResult}=require("express-validator")
const Post =require(".//../models/Post");
const User =require(".//../models/User")
//create new post
 router.post("/",
 auth,
 check("text","Text is required").notEmpty(),
 async(req,res)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    try{
        const user =await User.findById(req.user.id).select("-password");
        const newPost =new Post ({
            text:req.body.text,
            name:user.name,
            user:req.user.id
        });
        const post =await newPost.save();
        res.json(post);
    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
 });

 //get all post
 router.get("/",
 auth,
async (req,res)=>{
    try{
        const posts=  await Post.find().sort({date:-1});
        res.json(posts)    
    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
 });
 
 //get post by id
 router.get("/:post_id",
 auth,
async (req,res)=>{
    try{
        const post=  await Post.findById(req.params.post_id);
        if (!post){
            res.status(404).json({msg:"post not found"})
        }
        res.json(post)    
    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
 });
//add like
router.put("/like/:post_id",
    auth,async (req,res)=>{
    try{
        const post=  await Post.findById(req.params.post_id);
        if(post.likes.some(like=>like.user.toString() === req.user.id)){
            return res.status(400).json({msg:"post already liked"});
        }
        
        post.likes.unshift({user:req.user.id});
        await post.save();
        res.json(post.likes);
    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
    });
    //unlike
    router.put("/unlike/:post_id",
    auth,async (req,res)=>{
    try{
        const post=  await Post.findById(req.params.post_id);
        if(!post.likes.some(like=>like.user.toString() === req.user.id)){
            return res.status(400).json({msg:"user has not like this post previously!"});
        }
        
        post.likes=post.likes.filter((like)=>like.user.toString()!== req.user.id)
        await post.save();
        res.json(post.likes);
    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
    });

    //add comment 
    router.post("/comment/:post_id",
    auth,
    check("text","text is required").notEmpty(),
    async (req,res)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }

        try{
            const user= await User.findById(req.user.id).select("-password");
            const post =await Post.findById(req.params.post_id);

            const newComment ={
                text:req.body.text,
                name:user.name,
                user:req.user.id
            }
            post.comments.unshift(newComment);
            await post.save();
            res.json(post.comments)
        }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
    });

    //delete comment 
    router.delete("/comment/:post_id/:comment_id",
    auth,
    async (req,res)=>{
        try{
            const post =await Post.findById(req.params.post_id);
            const comment=post.comments.find((comment)=> comment.id==req.params.comment_id)
            if(!comment) return res.status(404).json({msg:"comment does not exist"})
            if(comment.user.toString() != req.user.id) return res.status(401).json({msg:"user is not authorized"});
           

            post.comments=post.comments.filter((comment)=>comment.id!==req.params.comment_id);
            await post.save();
            res.json(post.comments)
        }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
    });

    //delete post 
    router.delete("/:post_id",
    auth,
    async (req,res)=>{
        try{
            const post =await Post.findById(req.params.post_id);
            console.log(post)
            if(!post) return res.status(404).json({msg:"post does not exist"})
            if(post.user.toString() != req.user.id) return res.status(401).json({msg:"user is not authorized"});
           
            await post.deleteOne();
            
            res.json({msg:"post is removed"})
        }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
    });    
 module.exports=router;
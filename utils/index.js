const jwt = require("jsonwebtoken");
const config= require("config");

const auth =(req,res,next)=>{
    const token=req.header("x-auth-token");
    if(!token) return res.status(401).json({masg:"Token is not available, authorization denied."});
    try{
        jwt.verify(token,config.get("jwtSecret"),(error,decoded)=>{
        if(error)return res.status(401).json({msg:"Token is not valid, authorization denied."});
        else{
            req.user=decoded.user;//this is the value i add by the paylond in the login
            next();//add when i create a middleware // most added to complete the API proccessing
        }
        })
    }catch(err){
        console.log(err.massege);
        res.status(500).send(err.massege);
    }
 }

 module.exports={auth};
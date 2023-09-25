const mongoose=require("mongoose");
const config=require("config");
const db=config.get("mongoConnectionString");

async function connectDB(){
try {
    await mongoose.connect(db);
    console.log("connect to the DB successfully");
}catch(err){
console.error(err)
process.exit(1);
}}

module.exports=connectDB;
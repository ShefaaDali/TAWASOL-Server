const express =require("express");
const connectDB=require("./config/db");
const PORT=process.env.PORT || 4000;
const app = express();
app.use(express.json()); //parse the request use json
app.use("/api/users",require("./routes/users"));
app.use("/api/profiles",require("./routes/profiles"));
app.use("/api/posts",require("./routes/posts"));

connectDB();
app.get("/",(req,res)=>res.send("server is working correctly"))

app.listen(PORT,()=>console.log(`server has started in Port ${PORT}`))
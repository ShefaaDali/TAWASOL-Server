const { default: mongoose } = require("mongoose");
const monngoose = require("mongoose");

const PostSchema =new monngoose.Schema({
    user:{
        type:monngoose.Schema.Types.ObjectId
    },
    text:{
        type:String,
        required:true
    },
    name:{
    type:String,
    required:true 
    },
    likes:[
        {
            user:{
                type:monngoose.Schema.Types.ObjectId
            }
        }
    ],
    comments:[
        {
            user:{
                type:monngoose.Schema.Types.ObjectId
            },
            text:{
                type:String,
                required:true
            },
            name:{
                type:String,
                required:true
            },
            date:{
                type:Date,
                default:Date.now
            }

        }
    ],
    date:{
        type:Date,
        default:Date.now
    }
})

module.exports= mongoose.model("post",PostSchema)
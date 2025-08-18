const mongoose=require("mongoose")

const Schema = new mongoose.Schema({
    id:String,
    "t-id":String,
    name:String,
    email:String,
    password:String
})

const model=mongoose.model("teachers",Schema)

module.exports=model
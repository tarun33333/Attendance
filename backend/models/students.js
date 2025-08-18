const mongoose=require("mongoose")

const Schema = new mongoose.Schema({
    id:String,
    name:String,
    roll:String,
    classId:String,
    email:String,
    password:String
})

const model=mongoose.model("students",Schema)

module.exports=model
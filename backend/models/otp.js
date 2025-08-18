const mongoose=require("mongoose");

const Schema = new mongoose.Schema({
    period: Number,
    dept:String,
    teacher:String,
    "t-id":String,
    otp:String
});

module.exports=mongoose.model("otps",Schema);
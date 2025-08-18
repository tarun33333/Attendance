const express=require('express')
var router = express.Router();
const Otp=require('../models/otp');


router.get('/otps', async (req, res) => {
    try {
        const otps = await Otp.find();
        res.status(200).json(otps);
    } catch (err) {
        res.status(500).json({ msg: "Error fetching OTPs", error: err });
    }
});

router.post('/otpgen',async (req,res)=>{
    try{
        const {period,dept,teacher}=req.body
        const otpValue = String(Math.floor(100000 + Math.random() * 900000));
        const otpData = new Otp({period, dept, otp: otpValue, teacher: teacher, "t-id": req.body["t-id"] });
        await otpData.save();
        res.status(201).json({ msg: "OTP generated successfully", otp: otpValue });
    }catch(err){
        console.log(err);
    }
})


module.exports = router;
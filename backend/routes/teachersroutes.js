var express = require('express');
var router = express.Router();
const Teachers=require('../models/teachers')
const TeachersSch=require('../models/teacherschedule')
const Attendance=require('../models/attendance')
const Students=require('../models/students')


router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


//login
router.post('/login',async (req,res)=>{
    try{

        const {email,password}=req.body
        const user=await Teachers.findOne({email})

        if(!user)
            return res.status(404).send({msg:"User not found"})

        if(user.password === password)
            return res.status(200).json({user, msg:"Login successful"})
        else
            return res.status(400).send({msg:"password wrong"})

    }catch(err){
        res.status(500).send({msg:err})
        console.log(err);
    }

})


//teachers schedules DashBoard


router.get('/tdyschedule/:id',async (req,res)=>{
    const id=req.params.id;

    const user = await TeachersSch.findOne({"t-id":id})

    if(!user)
        return res.status(404).send({msg:"no schedule allocated", data:[]})

    const today = new Date();
    const dayName = today.toLocaleString('en-US', { weekday: 'long' });
   

    const todaySchedule = user.week.find(d => d.day === dayName);
    if (!todaySchedule) {
        return res.status(200).send({ msg: "No schedule for today", data: [] });
    }

    res.status(200).send({msg:"Today schedule",data:todaySchedule});

    

})



router.get('/dateschedule/:id/:date',async (req,res)=>{

        const { id, date } = req.params; // date format: "11.08.2025"
      
        if (!id || !date) {
            return res.status(400).send({ msg: "Teacher ID and date are required", data: [] });
        }

        const user = await TeachersSch.findOne({ "t-id":id});

        if(!user) {
            return res.status(404).send({ msg: "No schedule allocated", data: [] });
        }

         const [day, month, year] = date.split('.');
        const dateObj = new Date(`${year}-${month}-${day}`);

        // Get day name from given date
        const dayName = dateObj.toLocaleString('en-US', { weekday: 'long' });

        // Find schedule for that day
        const selectedDaySchedule = user.week.find(d => d.day === dayName);
        if (!selectedDaySchedule) {
            return res.status(200).send({ msg: `No schedule for ${dayName}`, data: [] });
        }

        res.status(200).send({ 
            msg: `Schedule for ${date} (${dayName})`, 
            data: selectedDaySchedule 
        });

})


//class attendence to view


router.get('/attendance/:classId/:date', async (req, res) => {
    try {
        const { classId, date } = req.params;

        if (!classId || !date) {
            return res.status(400).json({ msg: "classId and date are required", data: [] });
        }

        // Get students for the class
        const students = await Students.find({ classId }).lean();

        // Get attendance for that date & class
        const attendance = await Attendance.find({ classId, date }).lean();

        // Merge students with attendance
        const merged = students.map(stu => {
            const record = attendance.find(att => att.studentId === stu.studentId);
            return {
                ...stu,
                status: record ? record.status : "Absent"
            };
        });

        res.status(200).json({ msg: "Attendance data", data: merged });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error"});
    }
});



router.get('/all',async (req,res)=>{
  const user=await Teachers.find();

  res.status(200).send(user)
})

module.exports = router;

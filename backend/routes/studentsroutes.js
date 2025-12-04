var express = require('express');
var router = express.Router();
const Student = require('../models/students');
const TeachersSch = require('../models/teacherschedule');

router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

// Get all students (admin use)
router.get('/all', async (req, res) => {
  try {
    const users = await Student.find();
    res.status(200).send(users);
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: 'Error fetching students' });
  }
});

// Student login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Student.findOne({ email });

    if (!user) {
      return res.status(404).send({ msg: 'User not found' });
    }

    if (user.password === password) {
      return res.status(200).json({ user, msg: 'Login successful' });
    } else {
      return res.status(400).send({ msg: 'Password wrong' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: 'Server error' });
  }
});

// Today's schedule for a class (aggregated from all teachers' schedules)
router.get('/todayschedule/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    if (!classId) {
      return res.status(400).send({ msg: 'classId is required', data: [] });
    }

    const today = new Date();
    const dayName = today.toLocaleString('en-US', { weekday: 'long' });

    // Find all teachers schedules
    const allSchedules = await TeachersSch.find().lean();

    // Collect periods for this class on today's day across all teachers
    const periods = [];
    allSchedules.forEach(teacherSch => {
      const dayData = teacherSch.week.find(d => d.day === dayName);
      if (dayData && Array.isArray(dayData.periods)) {
        dayData.periods
          .filter(p => p.dept === classId)
          .forEach(p => {
            periods.push({
              period: p.period,
              dept: p.dept,
              subject: p.subject,
              teacher: teacherSch['t-id'] // we don't have teacher name here, only id
            });
          });
      }
    });

    // Sort by period number
    periods.sort((a, b) => a.period - b.period);

    res.status(200).send({ msg: 'Today schedule', data: periods });
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: 'Server error', data: [] });
  }
});

module.exports = router;

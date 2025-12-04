const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendance');

// Create attendance record
router.post('/', async (req, res) => {
  try {
    const { studentId, name, classId, period, status, staff, date } = req.body;

    if (!studentId || !classId || !period || !status || !date) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const record = new Attendance({
      studentId,
      name,
      classId,
      period,
      status,
      staff,
      date
    });

    await record.save();
    res.status(201).json({ msg: 'Attendance marked', data: record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error saving attendance' });
  }
});

module.exports = router;



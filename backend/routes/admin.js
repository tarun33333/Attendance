const express = require('express');
const router = express.Router();

const Teachers = require('../models/teachers');
const Students = require('../models/students');
const TeachersSch = require('../models/teacherschedule');
const ClassSchedules = require('../models/classschedule');

// Helper to map Mongo _id to id for frontend compatibility
const withId = (doc) => {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  return { ...obj, id: obj._id };
};

// ----- Teachers CRUD -----
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await Teachers.find();
    res.status(200).json(teachers.map(withId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error fetching teachers' });
  }
});

router.post('/teachers', async (req, res) => {
  try {
    const teacher = new Teachers(req.body);
    await teacher.save();
    res.status(201).json(withId(teacher));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error creating teacher' });
  }
});

router.delete('/teachers/:id', async (req, res) => {
  try {
    await Teachers.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error deleting teacher' });
  }
});

// ----- Students CRUD -----
router.get('/students', async (req, res) => {
  try {
    const students = await Students.find();
    res.status(200).json(students.map(withId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error fetching students' });
  }
});

router.post('/students', async (req, res) => {
  try {
    const student = new Students(req.body);
    await student.save();
    res.status(201).json(withId(student));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error creating student' });
  }
});

router.delete('/students/:id', async (req, res) => {
  try {
    await Students.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error deleting student' });
  }
});

// ----- Teacher schedules (per teacher) -----
router.get('/teachers-schedule', async (req, res) => {
  try {
    const docs = await TeachersSch.find().lean();
    const mapped = docs.map(doc => ({
      ...doc,
      id: doc._id,
      week: (doc.week || []).map(day => ({
        ...day,
        periods: (day.periods || []).map(p => ({
          ...p,
          id: p._id
        }))
      }))
    }));
    res.status(200).json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error fetching teacher schedules' });
  }
});

router.post('/teachers-schedule', async (req, res) => {
  try {
    const doc = new TeachersSch(req.body);
    await doc.save();
    res.status(201).json(withId(doc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error creating teacher schedule' });
  }
});

router.put('/teachers-schedule/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await TeachersSch.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ msg: 'Schedule not found' });
    res.status(200).json(withId(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error updating teacher schedule' });
  }
});

// ----- Class schedules (per class) -----
router.get('/class-schedules', async (req, res) => {
  try {
    const docs = await ClassSchedules.find().lean();
    const mapped = docs.map(doc => ({
      ...doc,
      id: doc._id
    }));
    res.status(200).json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error fetching class schedules' });
  }
});

router.post('/class-schedules', async (req, res) => {
  try {
    const doc = new ClassSchedules(req.body);
    await doc.save();
    res.status(201).json(withId(doc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error creating class schedule' });
  }
});

router.put('/class-schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ClassSchedules.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ msg: 'Class schedule not found' });
    res.status(200).json(withId(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error updating class schedule' });
  }
});

module.exports = router;



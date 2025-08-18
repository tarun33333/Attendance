const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
    period: Number ,
    dept: String,
    subject: String
});

const weekDaySchema = new mongoose.Schema({
    day: String,
    periods:[periodSchema]
});

const teacherSchema = new mongoose.Schema({
    "t-id": { type: String, unique: true },
    week: { type: [weekDaySchema], default: [] }
});

module.exports = mongoose.model('teachers-schedules', teacherSchema);
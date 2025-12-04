const mongoose = require('mongoose');

const classPeriodSchema = new mongoose.Schema({
  period: Number,
  "t-id": String,
  teacher: String,
  subject: String
});

const classDaySchema = new mongoose.Schema({
  day: String,
  schedule: [classPeriodSchema]
});

const classScheduleSchema = new mongoose.Schema({
  classId: { type: String, unique: true },
  week: { type: [classDaySchema], default: [] }
});

module.exports = mongoose.model('class-schedules', classScheduleSchema);



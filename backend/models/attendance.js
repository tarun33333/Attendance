const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    id: String,
    studentId: String,
    name: String,
    classId: String,
    period: Number,
    status: String,
    staff: String,
    date: String
});

module.exports = mongoose.model('attendances', attendanceSchema);


import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

const API_URL = `${process.env.REACT_APP_BACKEND}/admin/class-schedules`;

export default function ClassScheduleManager() {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    classId: "",
    day: "Monday",
    period: "",
    teacherId: "",
    teacherName: "",
    subject: ""
  });
  const [editingClassId, setEditingClassId] = useState(null); // ID of the class doc
  const [editingPeriod, setEditingPeriod] = useState(null); // The period number being edited (since periods are unique per day)
  const [editingDay, setEditingDay] = useState(null);

  // Load schedules
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setSchedules(res.data);
      setFilteredSchedules(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredSchedules(schedules);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredSchedules(
        schedules.filter((c) =>
          c.classId.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchTerm, schedules]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditPeriod = (classDoc, day, periodData) => {
    setEditingClassId(classDoc.id || classDoc._id);
    setEditingDay(day);
    setEditingPeriod(periodData.period);

    setFormData({
      classId: classDoc.classId,
      day: day,
      period: periodData.period,
      teacherId: periodData["t-id"],
      teacherName: periodData.teacher,
      subject: periodData.subject
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingClassId(null);
    setEditingDay(null);
    setEditingPeriod(null);
    setFormData({
      classId: "",
      day: "Monday",
      period: "",
      teacherId: "",
      teacherName: "",
      subject: ""
    });
  };

  // Add new schedule
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { classId, day, period, teacherId, teacherName, subject } = formData;

    // Check for "Free" period
    const isFree = subject.toLowerCase() === "free";

    if (!classId || !day || !period || (!isFree && (!teacherId || !teacherName)) || !subject) {
      alert("Fill all fields (Teacher details optional for 'Free' periods)");
      return;
    }

    // Auto-fill details for Free period if missing
    const finalTeacherId = isFree && !teacherId ? "Free" : teacherId;
    const finalTeacherName = isFree && !teacherName ? "Free" : teacherName;

    try {
      let existingClass = schedules.find((cls) => cls.classId === classId);

      if (existingClass) {
        // Class exists
        // If editing, we might need to remove the old period first
        if (editingClassId) {
          // Remove old period logic
          let oldDayData = existingClass.week.find(w => w.day === editingDay);
          if (oldDayData) {
            oldDayData.schedule = oldDayData.schedule.filter(p => p.period !== editingPeriod);
          }
        }

        let weekData = existingClass.week.find((w) => w.day === day);
        const newPeriodObj = {
          period: parseInt(period),
          "t-id": finalTeacherId,
          teacher: finalTeacherName,
          subject: subject,
        };

        if (weekData) {
          // Check if period already exists in this day (if not editing or if changed period number)
          const collision = weekData.schedule.find(p => p.period === parseInt(period));
          if (collision && (!editingClassId || (editingDay === day && editingPeriod !== parseInt(period)))) {
            alert(`Period ${period} already exists for ${day}`);
            return;
          }
          weekData.schedule.push(newPeriodObj);
          weekData.schedule.sort((a, b) => a.period - b.period);
        } else {
          existingClass.week.push({
            day: day,
            schedule: [newPeriodObj],
          });
        }

        await axios.put(`${API_URL}/${existingClass.id}`, existingClass);
      } else {
        if (editingClassId) {
          alert("Cannot edit non-existent class");
          return;
        }
        // Class doesn't exist → create it
        let newClass = {
          classId: classId,
          week: [
            {
              day: day,
              schedule: [
                {
                  period: parseInt(period),
                  "t-id": finalTeacherId,
                  teacher: finalTeacherName,
                  subject: subject,
                },
              ],
            },
          ],
        };
        await axios.post(API_URL, newClass);
      }

      await fetchSchedules();
      handleCancel();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  // Delete a period
  const handleDeletePeriod = async (classId, day, period) => {
    if (!window.confirm("Delete this period?")) return;
    try {
      let classData = schedules.find((c) => c.classId === classId);
      let dayData = classData.week.find((w) => w.day === day);
      dayData.schedule = dayData.schedule.filter((p) => p.period !== period);

      await axios.put(`${API_URL}/${classData.id}`, classData);
      await fetchSchedules();
      if (editingClassId && editingPeriod === period && editingDay === day) {
        handleCancel();
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2 className="admin-title">Class Schedule Manager</h2>
        <p className="admin-subtitle">Manage weekly schedules for classes</p>
      </div>

      <div className="admin-grid">
        {/* Left: Form */}
        <div className="card">
          <h3 className="section-title">{editingClassId ? "Edit Period" : "Add Period"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Class ID</label>
              <input
                className="input"
                name="classId"
                placeholder="e.g. IT-A"
                value={formData.classId}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Day</label>
              <select
                className="input"
                name="day"
                value={formData.day}
                onChange={handleInputChange}
              >
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Period Number</label>
              <input
                className="input"
                type="number"
                name="period"
                placeholder="e.g. 1"
                value={formData.period}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Teacher ID</label>
              <input
                className="input"
                name="teacherId"
                placeholder="e.g. T-101"
                value={formData.teacherId}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Teacher Name</label>
              <input
                className="input"
                name="teacherName"
                placeholder="e.g. John Doe"
                value={formData.teacherName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                className="input"
                name="subject"
                placeholder="e.g. Mathematics"
                value={formData.subject}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="button button--primary button--full">
                {editingClassId ? "Update Period" : "Add Period"}
              </button>
              {editingClassId && (
                <button type="button" className="button button--secondary" onClick={handleCancel}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: List */}
        <div className="card">
          <h3 className="section-title">
            Schedules
            <input
              className="input"
              style={{ width: 'auto', fontSize: '14px', padding: '6px 10px' }}
              placeholder="Search Class ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </h3>

          <div className="list-container">
            {loading ? <p className="empty-state">Loading...</p> : (
              filteredSchedules.length === 0 ? <p className="empty-state">No schedules found.</p> :
                filteredSchedules.map((cls) => (
                  <div className="schedule-group" key={cls.id || cls._id}>
                    <div style={{
                      background: '#f1f5f9',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '10px',
                      fontWeight: '600',
                      color: '#334155'
                    }}>
                      Class: {cls.classId}
                    </div>

                    {cls.week.map((w) => (
                      w.schedule.length > 0 && (
                        <div className="day-block" key={w.day}>
                          <div className="day-title" style={{ fontSize: '13px' }}>{w.day}</div>
                          <div className="list">
                            {w.schedule.map((p) => (
                              <div
                                className={`list-item ${editingClassId === (cls.id || cls._id) && editingPeriod === p.period && editingDay === w.day ? "selected" : ""}`}
                                key={p.period}
                                onClick={() => handleEditPeriod(cls, w.day, p)}
                              >
                                <div className="item-info">
                                  <span className="item-name">Period {p.period}: {p.subject}</span>
                                  <span className="item-details">{p.teacher} ({p["t-id"]})</span>
                                </div>
                                <div className="item-actions">
                                  <button
                                    className="button button--danger"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePeriod(cls.classId, w.day, p.period);
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


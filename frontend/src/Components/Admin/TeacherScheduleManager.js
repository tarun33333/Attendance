import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

const API_URL = `${process.env.REACT_APP_BACKEND}/admin/teachers-schedule`;

export default function TeacherScheduleManager() {
  const [teacherSchedules, setTeacherSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    teacherId: "",
    day: "Monday",
    period: "",
    dept: "",
    subject: ""
  });
  const [editingId, setEditingId] = useState(null); // ID of the period being edited
  const [editingTeacherId, setEditingTeacherId] = useState(null); // ID of the teacher doc

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setTeacherSchedules(res.data);
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
      setFilteredSchedules(teacherSchedules);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredSchedules(
        teacherSchedules.filter((t) =>
          t["t-id"].toLowerCase().includes(lower)
        )
      );
    }
  }, [searchTerm, teacherSchedules]);

  const generateId = () => Math.random().toString(36).slice(2, 6);

  const ensureWeekSkeleton = () => [
    { day: "Monday", periods: [] },
    { day: "Tuesday", periods: [] },
    { day: "Wednesday", periods: [] },
    { day: "Thursday", periods: [] },
    { day: "Friday", periods: [] },
    { day: "Saturday", periods: [] }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditPeriod = (teacherDoc, day, periodData) => {
    setEditingId(periodData.id || periodData._id);
    setEditingTeacherId(teacherDoc.id || teacherDoc._id);
    setFormData({
      teacherId: teacherDoc["t-id"],
      day: day,
      period: periodData.period,
      dept: periodData.dept,
      subject: periodData.subject
    });
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingTeacherId(null);
    setFormData({
      teacherId: "",
      day: "Monday",
      period: "",
      dept: "",
      subject: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { teacherId, day, period, dept, subject } = formData;

    // Check for "Free" period
    const isFree = subject.toLowerCase() === "free";

    if (!teacherId || !day || !period || (!isFree && !dept) || !subject) {
      alert("Fill all fields (Dept optional for 'Free' periods)");
      return;
    }

    // Auto-fill details for Free period if missing
    const finalDept = isFree && !dept ? "Free" : dept;

    try {
      // Find existing teacher record
      const existing = teacherSchedules.find((t) => t["t-id"] === teacherId);

      if (existing) {
        const updated = { ...existing };

        // If editing, remove the old period first (if it's in a different day or just to replace)
        if (editingId) {
          // We need to find where the old period was to remove it. 
          // Since we might have changed the day, we iterate all days.
          updated.week.forEach(d => {
            d.periods = d.periods.filter(p => (p.id !== editingId && p._id !== editingId));
          });
        }

        // Add/Update the period
        const dayEntry = updated.week.find((d) => d.day === day);
        const newPeriodObj = {
          period: parseInt(period, 10),
          dept: finalDept,
          subject,
          id: editingId || generateId() // Keep ID if editing, else new
        };

        if (dayEntry) {
          dayEntry.periods.push(newPeriodObj);
          // Sort periods
          dayEntry.periods.sort((a, b) => a.period - b.period);
        } else {
          // Should not happen with skeleton, but safe fallback
          updated.week.push({
            day,
            periods: [newPeriodObj]
          });
        }

        if (existing.id) {
          await axios.put(`${API_URL}/${existing.id}`, updated);
        } else {
          await axios.post(API_URL, updated);
        }
      } else {
        // Create new teacher record
        if (editingId) {
          alert("Cannot edit a non-existent teacher record. This shouldn't happen.");
          return;
        }
        const newTeacherSchedule = {
          "t-id": teacherId,
          week: ensureWeekSkeleton().map((d) =>
            d.day === day
              ? { ...d, periods: [{ period: parseInt(period, 10), dept: finalDept, subject, id: generateId() }] }
              : d
          )
        };
        await axios.post(API_URL, newTeacherSchedule);
      }

      await fetchSchedules();
      handleCancel();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  const handleDeletePeriod = async (teacherNodeId, day, periodId) => {
    if (!window.confirm("Delete this period?")) return;
    try {
      const target = teacherSchedules.find((t) => t.id === teacherNodeId || t._id === teacherNodeId);
      if (!target) return;

      const updated = { ...target };
      const dayEntry = updated.week.find((d) => d.day === day);
      if (!dayEntry) return;

      dayEntry.periods = dayEntry.periods.filter((p) => p.id !== periodId && p._id !== periodId);

      await axios.put(`${API_URL}/${target.id || target._id}`, updated);
      await fetchSchedules();
      if (editingId === periodId) handleCancel();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // Deduping logic for display (though backend should handle uniqueness ideally)
  const dedupedByTeacher = Object.values(
    filteredSchedules.reduce((acc, item) => {
      const key = item["t-id"];
      const existing = acc[key];
      if (!existing) {
        acc[key] = item;
      } else {
        acc[key] = existing.id ? existing : item;
      }
      return acc;
    }, {})
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2 className="admin-title">Teacher Schedule Manager</h2>
        <p className="admin-subtitle">Manage weekly schedules for teachers</p>
      </div>

      <div className="admin-grid">
        {/* Left: Form */}
        <div className="card">
          <h3 className="section-title">{editingId ? "Edit Period" : "Add Period"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Teacher ID</label>
              <input
                className="input"
                name="teacherId"
                placeholder="e.g. T-101"
                value={formData.teacherId}
                onChange={handleInputChange}
                required
              // If editing, maybe lock teacher ID? For now allow change.
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
              <label className="form-label">Department / Class</label>
              <input
                className="input"
                name="dept"
                placeholder="e.g. IT-A"
                value={formData.dept}
                onChange={handleInputChange}
               
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
                {editingId ? "Update Period" : "Add Period"}
              </button>
              {editingId && (
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
              placeholder="Search Teacher ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </h3>

          <div className="list-container">
            {loading ? <p className="empty-state">Loading...</p> : (
              dedupedByTeacher.length === 0 ? <p className="empty-state">No schedules found.</p> :
                dedupedByTeacher.map((teacher) => (
                  <div className="schedule-group" key={teacher.id || teacher._id}>
                    <div style={{
                      background: '#f1f5f9',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '10px',
                      fontWeight: '600',
                      color: '#334155'
                    }}>
                      Teacher: {teacher["t-id"]}
                    </div>

                    {teacher.week.map((d) => (
                      d.periods.length > 0 && (
                        <div className="day-block" key={d.day}>
                          <div className="day-title" style={{ fontSize: '13px' }}>{d.day}</div>
                          <div className="list">
                            {d.periods.map((p) => (
                              <div
                                className={`list-item ${editingId === (p.id || p._id) ? "selected" : ""}`}
                                key={p.id || p._id}
                                onClick={() => handleEditPeriod(teacher, d.day, p)}
                              >
                                <div className="item-info">
                                  <span className="item-name">Period {p.period}: {p.subject}</span>
                                  <span className="item-details">{p.dept}</span>
                                </div>
                                <div className="item-actions">
                                  <button
                                    className="button button--danger"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePeriod(teacher.id || teacher._id, d.day, p.id || p._id);
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


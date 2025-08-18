import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

const API_URL = "http://localhost:3001/teachers-schedule";

export default function TeacherScheduleManager() {
  const [teacherSchedules, setTeacherSchedules] = useState([]);
  const [newPeriod, setNewPeriod] = useState({
    teacherId: "", // corresponds to "t-id"
    day: "", // e.g., Monday
    period: "", // number
    dept: "",
    subject: ""
  });

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(API_URL);
      setTeacherSchedules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const generateId = () => Math.random().toString(36).slice(2, 6);

  const ensureWeekSkeleton = () => [
    { day: "Monday", periods: [] },
    { day: "Tuesday", periods: [] },
    { day: "Wednesday", periods: [] },
    { day: "Thursday", periods: [] },
    { day: "Friday", periods: [] },
    { day: "Saturday", periods: [] }
  ];

  const handleAddPeriod = async () => {
    const { teacherId, day, period, dept, subject } = newPeriod;
    if (!teacherId || !day || !period || !dept || !subject) {
      alert("Fill all fields");
      return;
    }

    try {
      const existing = teacherSchedules.find((t) => t["t-id"] === teacherId);

      if (existing) {
        const updated = { ...existing };
        const dayEntry = updated.week.find((d) => d.day === day);
        if (dayEntry) {
          dayEntry.periods = [
            ...dayEntry.periods,
            { period: parseInt(period, 10), dept, subject, id: generateId() }
          ];
        } else {
          updated.week = [
            ...updated.week,
            { day, periods: [{ period: parseInt(period, 10), dept, subject, id: generateId() }] }
          ];
        }

        if (existing.id) {
          await axios.put(`${API_URL}/${existing.id}`, updated);
        } else {
          await axios.post(API_URL, updated);
        }
      } else {
        const newTeacherSchedule = {
          "t-id": teacherId,
          week: ensureWeekSkeleton().map((d) =>
            d.day === day
              ? { ...d, periods: [{ period: parseInt(period, 10), dept, subject, id: generateId() }] }
              : d
          )
        };
        await axios.post(API_URL, newTeacherSchedule);
      }

      await fetchSchedules();
      setNewPeriod({ teacherId: "", day: "", period: "", dept: "", subject: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePeriod = async (teacherNodeId, day, periodId) => {
    try {
      const target = teacherSchedules.find((t) => t.id === teacherNodeId);
      if (!target) return;
      const updated = { ...target };
      const dayEntry = updated.week.find((d) => d.day === day);
      if (!dayEntry) return;
      dayEntry.periods = dayEntry.periods.filter((p) => p.id !== periodId);
      await axios.put(`${API_URL}/${teacherNodeId}`, updated);
      await fetchSchedules();
    } catch (err) {
      console.error(err);
    }
  };

  const dedupedByTeacher = Object.values(
    teacherSchedules.reduce((acc, item) => {
      const key = item["t-id"];
      const existing = acc[key];
      if (!existing) {
        acc[key] = item;
      } else {
        // prefer the one that has an id (so it's editable)
        acc[key] = existing.id ? existing : item;
      }
      return acc;
    }, {})
  );

  return (
    <div className="admin-container">
      <h2 className="admin-title">Teacher Schedule Manager</h2>

      <div className="form-row">
        <input className="input" placeholder="Teacher ID (e.g., T001)" value={newPeriod.teacherId} onChange={(e) => setNewPeriod({ ...newPeriod, teacherId: e.target.value })} />
        <input className="input" placeholder="Day (e.g., Monday)" value={newPeriod.day} onChange={(e) => setNewPeriod({ ...newPeriod, day: e.target.value })} />
        <input className="input" placeholder="Period (number)" type="number" value={newPeriod.period} onChange={(e) => setNewPeriod({ ...newPeriod, period: e.target.value })} />
        <input className="input" placeholder="Department (e.g., IT-I)" value={newPeriod.dept} onChange={(e) => setNewPeriod({ ...newPeriod, dept: e.target.value })} />
        <input className="input" placeholder="Subject" value={newPeriod.subject} onChange={(e) => setNewPeriod({ ...newPeriod, subject: e.target.value })} />
        <button className="button button--primary" onClick={handleAddPeriod}>Add / Update Period</button>
      </div>

      {dedupedByTeacher.map((teacher) => (
        <div className="card schedule-group" key={teacher.id}>
          <h3 className="section-title">Teacher: {teacher["t-id"]}</h3>
          {teacher.week.map((d) => (
            <div className="day-block" key={d.day}>
              <div className="day-title">{d.day}</div>
              {d.periods.length === 0 ? (
                <div className="empty-state">No periods</div>
              ) : (
                <ul className="list">
                  {d.periods.map((p) => (
                    <li className="list-item" key={p.id}>
                      <span>Period {p.period}: {p.subject} [{p.dept}]</span>
                      <button className="button button--danger" onClick={() => handleDeletePeriod(teacher.id, d.day, p.id)}>Delete</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

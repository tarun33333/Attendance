import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

const API_URL = `${process.env.REACT_APP_BACKEND}/admin/class-schedules`;

export default function ClassScheduleManager() {
  const [schedules, setSchedules] = useState([]);
  const [newClassId, setNewClassId] = useState("");
  const [newDay, setNewDay] = useState("");
  const [newPeriod, setNewPeriod] = useState("");
  const [newTeacher, setNewTeacher] = useState("");
  const [newTid, setNewTid] = useState("");
  const [newSubject, setNewSubject] = useState("");

  // Load schedules
  useEffect(() => {
    axios.get(API_URL).then((res) => setSchedules(res.data));
  }, []);

  // Add new schedule
  const handleAddSchedule = async () => {
    if (!newClassId || !newDay || !newPeriod || !newTeacher || !newSubject) {
      alert("Fill all fields");
      return;
    }

    let existingClass = schedules.find((cls) => cls.classId === newClassId);

    if (existingClass) {
      // Class exists
      let weekData = existingClass.week.find((w) => w.day === newDay);

      if (weekData) {
        // Day exists → add new period
        weekData.schedule.push({
          period: parseInt(newPeriod),
          "t-id": newTid,
          teacher: newTeacher,
          subject: newSubject,
        });
      } else {
        // Day doesn't exist → create it
        existingClass.week.push({
          day: newDay,
          schedule: [
            {
              period: parseInt(newPeriod),
              "t-id": newTid,
              teacher: newTeacher,
              subject: newSubject,
            },
          ],
        });
      }

      await axios.put(`${API_URL}/${existingClass.id}`, existingClass);
    } else {
      // Class doesn't exist → create it
      let newClass = {
        classId: newClassId,
        week: [
          {
            day: newDay,
            schedule: [
              {
                period: parseInt(newPeriod),
                "t-id": newTid,
                teacher: newTeacher,
                subject: newSubject,
              },
            ],
          },
        ],
      };
      await axios.post(API_URL, newClass);
    }

    // Refresh data
    const res = await axios.get(API_URL);
    setSchedules(res.data);

    // Clear inputs
    setNewClassId("");
    setNewDay("");
    setNewPeriod("");
    setNewTeacher("");
    setNewTid("");
    setNewSubject("");
  };

  // Delete a period
  const handleDeletePeriod = async (classId, day, period) => {
    let classData = schedules.find((c) => c.classId === classId);

    let dayData = classData.week.find((w) => w.day === day);
    dayData.schedule = dayData.schedule.filter((p) => p.period !== period);

    await axios.put(`${API_URL}/${classData.id}`, classData);
    const res = await axios.get(API_URL);
    setSchedules(res.data);
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">Class Schedule Manager</h2>

      <div className="form-row">
        <input className="input" placeholder="Class ID" value={newClassId} onChange={(e) => setNewClassId(e.target.value)} />
        <input className="input" placeholder="Day" value={newDay} onChange={(e) => setNewDay(e.target.value)} />
        <input className="input" placeholder="Period" type="number" value={newPeriod} onChange={(e) => setNewPeriod(e.target.value)} />
        <input className="input" placeholder="Teacher ID" value={newTid} onChange={(e) => setNewTid(e.target.value)} />
        <input className="input" placeholder="Teacher Name" value={newTeacher} onChange={(e) => setNewTeacher(e.target.value)} />
        <input className="input" placeholder="Subject" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
        <button className="button button--primary" onClick={handleAddSchedule}>Add / Update</button>
      </div>

      {schedules.map((cls) => (
        <div className="card schedule-group" key={cls.id}>
          <h3 className="section-title">Class: {cls.classId}</h3>
          {cls.week.map((w) => (
            <div className="day-block" key={w.day}>
              <div className="day-title">{w.day}</div>
              <ul className="list">
                {w.schedule.map((p) => (
                  <li className="list-item" key={p.period}>
                    <span>Period {p.period}: {p.subject} ({p.teacher})</span>
                    <button className="button button--danger" onClick={() => handleDeletePeriod(cls.classId, w.day, p.period)}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

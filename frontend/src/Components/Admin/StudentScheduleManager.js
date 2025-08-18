import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

export default function StudentScheduleManager() {
  const [classSchedules, setClassSchedules] = useState([]);
  const [newClass, setNewClass] = useState({
    classId: "",
    week: []
  });

  // Fetch class schedules
  useEffect(() => {
    axios.get("http://localhost:3001/class-schedules")
      .then(res => setClassSchedules(res.data))
      .catch(err => console.error(err));
  }, []);

  // Add class schedule
  const handleAdd = () => {
    axios.post("http://localhost:3001/class-schedules", newClass)
      .then(res => setClassSchedules([...classSchedules, res.data]))
      .catch(err => console.error(err));
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">Student Schedule Manager</h2>
      <div className="form-row">
        <input className="input" placeholder="Class ID" onChange={e => setNewClass({ ...newClass, classId: e.target.value })} />
        <button className="button button--primary" onClick={handleAdd}>Add Class Schedule</button>
      </div>

      {classSchedules.map(c => (
        <div className="card schedule-group" key={c.id}>
          <h3 className="section-title">Class: {c.classId}</h3>
          {c.week.length === 0 ? (
            <div className="empty-state">No days yet</div>
          ) : (
            c.week.map((dayData, idx) => (
              <div className="day-block" key={idx}>
                <div className="day-title">{dayData.day}</div>
                {dayData.schedule.length === 0 ? (
                  <div className="empty-state">No periods</div>
                ) : (
                  <ul className="list">
                    {dayData.schedule.map((p, pIndex) => (
                      <li className="list-item" key={pIndex}>
                        <span>Period {p.period}: {p.subject} ({p.teacher})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}

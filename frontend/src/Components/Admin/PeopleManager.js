import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

const TEACHERS_URL = `${process.env.REACT_APP_BACKEND}/admin/teachers`;
const STUDENTS_URL = `${process.env.REACT_APP_BACKEND}/admin/students`;

export default function PeopleManager() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  const [newTeacher, setNewTeacher] = useState({
    "t-id": "",
    name: "",
    email: "",
    password: ""
  });

  const [newStudent, setNewStudent] = useState({
    name: "",
    roll: "",
    classId: "",
    email: "",
    password: ""
  });

  const fetchAll = async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        axios.get(TEACHERS_URL),
        axios.get(STUDENTS_URL)
      ]);
      setTeachers(tRes.data);
      setStudents(sRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const addTeacher = async () => {
    const { ["t-id"]: teacherId, name, email, password } = newTeacher;
    if (!teacherId || !name || !email || !password) {
      alert("Fill all teacher fields");
      return;
    }
    try {
      await axios.post(TEACHERS_URL, newTeacher);
      await fetchAll();
      setNewTeacher({ "t-id": "", name: "", email: "", password: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTeacher = async (id) => {
    try {
      await axios.delete(`${TEACHERS_URL}/${id}`);
      await fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const addStudent = async () => {
    const { name, roll, classId, email, password } = newStudent;
    if (!name || !roll || !classId || !email || !password) {
      alert("Fill all student fields");
      return;
    }
    try {
      await axios.post(STUDENTS_URL, newStudent);
      await fetchAll();
      setNewStudent({ name: "", roll: "", classId: "", email: "", password: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteStudent = async (id) => {
    try {
      await axios.delete(`${STUDENTS_URL}/${id}`);
      await fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">People Manager (Teachers & Students)</h2>

      <div className="admin-grid">
        <div className="card">
          <h3 className="section-title">Add Teacher</h3>
          <div className="form-row">
            <input className="input" placeholder="Teacher ID (t-id)" value={newTeacher["t-id"]} onChange={(e) => setNewTeacher({ ...newTeacher, "t-id": e.target.value })} />
            <input className="input" placeholder="Name" value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} />
            <input className="input" placeholder="Email" value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} />
            <input className="input" placeholder="Password" value={newTeacher.password} onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })} />
            <button className="button button--primary" onClick={addTeacher}>Add Teacher</button>
          </div>
          <ul className="list">
            {teachers.map((t) => (
              <li className="list-item" key={t.id}>
                <span>{t["t-id"]} - {t.name} ({t.email})</span>
                <button className="button button--danger" onClick={() => deleteTeacher(t.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3 className="section-title">Add Student</h3>
          <div className="form-row">
            <input className="input" placeholder="Name" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
            <input className="input" placeholder="Roll" value={newStudent.roll} onChange={(e) => setNewStudent({ ...newStudent, roll: e.target.value })} />
            <input className="input" placeholder="Class ID (e.g., IT-I)" value={newStudent.classId} onChange={(e) => setNewStudent({ ...newStudent, classId: e.target.value })} />
            <input className="input" placeholder="Email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} />
            <input className="input" placeholder="Password" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} />
            <button className="button button--primary" onClick={addStudent}>Add Student</button>
          </div>
          <ul className="list">
            {students.map((s) => (
              <li className="list-item" key={s.id}>
                <span>{s.name} - Roll {s.roll} - {s.classId} ({s.email})</span>
                <button className="button button--danger" onClick={() => deleteStudent(s.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}


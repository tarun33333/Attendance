import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

const TEACHERS_URL = `${process.env.REACT_APP_BACKEND}/admin/teachers`;
const STUDENTS_URL = `${process.env.REACT_APP_BACKEND}/admin/students`;

export default function PeopleManager() {
  const [activeTab, setActiveTab] = useState("teachers"); // 'teachers' | 'students'
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([
        axios.get(TEACHERS_URL),
        axios.get(STUDENTS_URL)
      ]);
      setTeachers(tRes.data);
      setStudents(sRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Reset form when tab changes
  useEffect(() => {
    setEditingId(null);
    setFormData({});
  }, [activeTab]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isTeacher = activeTab === "teachers";
    const url = isTeacher ? TEACHERS_URL : STUDENTS_URL;

    try {
      if (editingId) {
        // Update
        await axios.put(`${url}/${editingId}`, formData);
      } else {
        // Create
        await axios.post(url, formData);
      }
      await fetchAll();
      handleCancel();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent triggering edit
    if (!window.confirm("Are you sure?")) return;

    const isTeacher = activeTab === "teachers";
    const url = isTeacher ? TEACHERS_URL : STUDENTS_URL;

    try {
      await axios.delete(`${url}/${id}`);
      if (editingId === id) handleCancel();
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // Render Helpers
  const renderTeacherForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Teacher ID</label>
        <input
          className="input"
          name="t-id"
          value={formData["t-id"] || ""}
          onChange={handleInputChange}
          placeholder="e.g. T-101"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Name</label>
        <input
          className="input"
          name="name"
          value={formData.name || ""}
          onChange={handleInputChange}
          placeholder="Full Name"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          className="input"
          type="email"
          name="email"
          value={formData.email || ""}
          onChange={handleInputChange}
          placeholder="email@example.com"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          className="input"
          name="password"
          value={formData.password || ""}
          onChange={handleInputChange}
          placeholder={editingId ? "Leave blank to keep same" : "Password"}
          required={!editingId}
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="button button--primary button--full">
          {editingId ? "Update Teacher" : "Add Teacher"}
        </button>
        {editingId && (
          <button type="button" className="button button--secondary" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  const renderStudentForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input
          className="input"
          name="name"
          value={formData.name || ""}
          onChange={handleInputChange}
          placeholder="Student Name"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Roll Number</label>
        <input
          className="input"
          name="roll"
          value={formData.roll || ""}
          onChange={handleInputChange}
          placeholder="e.g. 12345"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Class ID</label>
        <input
          className="input"
          name="classId"
          value={formData.classId || ""}
          onChange={handleInputChange}
          placeholder="e.g. IT-A"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          className="input"
          type="email"
          name="email"
          value={formData.email || ""}
          onChange={handleInputChange}
          placeholder="student@example.com"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          className="input"
          name="password"
          value={formData.password || ""}
          onChange={handleInputChange}
          placeholder={editingId ? "Leave blank to keep same" : "Password"}
          required={!editingId}
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="button button--primary button--full">
          {editingId ? "Update Student" : "Add Student"}
        </button>
        {editingId && (
          <button type="button" className="button button--secondary" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2 className="admin-title">People Management</h2>
        <p className="admin-subtitle">Manage teachers and students records</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "teachers" ? "active" : ""}`}
          onClick={() => setActiveTab("teachers")}
        >
          Teachers
        </button>
        <button
          className={`tab-button ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          Students
        </button>
      </div>

      <div className="admin-grid">
        {/* Left Column: Form */}
        <div className="card">
          <h3 className="section-title">
            {editingId ? "Edit Details" : `Add New ${activeTab === "teachers" ? "Teacher" : "Student"}`}
          </h3>
          {activeTab === "teachers" ? renderTeacherForm() : renderStudentForm()}
        </div>

        {/* Right Column: List */}
        <div className="card">
          <h3 className="section-title">
            {activeTab === "teachers" ? "All Teachers" : "All Students"}
            <span className="badge">
              {activeTab === "teachers" ? teachers.length : students.length}
            </span>
          </h3>

          <div className="list-container">
            {loading ? (
              <p className="empty-state">Loading...</p>
            ) : (
              <div className="list">
                {(activeTab === "teachers" ? teachers : students).map((item) => (
                  <div
                    key={item.id}
                    className={`list-item ${editingId === item.id ? "selected" : ""}`}
                    onClick={() => handleEdit(item)}
                  >
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-details">
                        {activeTab === "teachers"
                          ? `${item["t-id"]} • ${item.email}`
                          : `Roll: ${item.roll} • Class: ${item.classId}`
                        }
                      </span>
                    </div>
                    <div className="item-actions">
                      <button
                        className="button button--danger"
                        onClick={(e) => handleDelete(item.id, e)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {(activeTab === "teachers" ? teachers : students).length === 0 && (
                  <p className="empty-state">No records found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



import React, { useContext, useEffect, useState } from 'react';
import { Authcontext } from '../Auth';
import axios from 'axios';
import './styles.css';
import { useNavigate } from 'react-router-dom';

export default function Studentdash() {
  const { user, logout } = useContext(Authcontext);
  const [schedule, setSchedule] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [otpInput, setOtpInput] = useState({});
  const [otps, setOtps] = useState([]);
  const navigate = useNavigate();

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    if (!user || !user.classId) return;

    // Get today's schedule for this class from backend
    axios
      .get(`${process.env.REACT_APP_BACKEND}/student/todayschedule/${user.classId}`)
      .then(res => {
        setSchedule(res.data.data || []);
      })
      .catch(err => {
        console.error(err);
        setSchedule([]);
      });

    // Function to fetch OTPs
    const fetchOtps = () => {
      axios
        .get(`${process.env.REACT_APP_BACKEND}/otp/otps`)
        .then(res => {
          setOtps(res.data.filter(o => o.dept === user.classId));
        })
        .catch(err => console.error(err));
    };

    // Initial fetch
    fetchOtps();

    // Poll every 3 seconds
    const interval = setInterval(fetchOtps, 3000);

    return () => clearInterval(interval);
  }, [user]);

  const handleOtpSubmit = (period, dept) => {
    const enteredOtp = otpInput[period] || "";
    if (!enteredOtp) {
      alert("Please enter OTP");
      return;
    }

    const otpRecord = otps.find(o => o.dept === dept && o.period === period);
    if (!otpRecord) {
      alert("No OTP found for this period");
      return;
    }

    if (otpRecord.otp !== enteredOtp) {
      alert("Wrong OTP");
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const dataAtt = {
      studentId: user.id,
      name: user.name,
      classId: user.classId,
      period,
      status: "Present",
      staff: otpRecord.teacher,
      date: todayStr
    };

    axios
      .post(`${process.env.REACT_APP_BACKEND}/attendance`, dataAtt)
      .then(() => {
        setAttendance(prev => ({ ...prev, [period]: true }));
        axios
          .delete(`${process.env.REACT_APP_BACKEND}/otp/${otpRecord._id}`)
          .catch(err => console.error(err));
      })
      .catch(err => {
        console.error(err);
        alert("Failed to mark attendance");
      });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className='student-dashboard'>
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user.name}</h1>
          <p className="date-display">{today}, {dateStr}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
          <div className="user-avatar">
            {user.name.charAt(0)}
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <h2 className="section-title">Today's Schedule</h2>
        <div className="student-class-list">
          {schedule.length > 0 ? (
            schedule.map((x, index) => {
              const otpForPeriod = otps.find(o =>
                o.dept === user.classId &&
                o.period === x.period
              );
              return (
                <div key={`${x.dept || 'cls'}-${x.period}-${index}`} className="student-class-card">
                  <div className="card-header">
                    <span className="period-badge">Period {x.period}</span>
                    <span className="subject-name">{x.subject}</span>
                  </div>
                  <div className="card-body">
                    <div className="teacher-info">
                      <span className="label">Teacher</span>
                      <span className="value">{x.teacher}</span>
                    </div>
                    {attendance[x.period] ? (
                      <div className="status-badge present">
                        <span className="icon">✓</span> Marked Present
                      </div>
                    ) : otpForPeriod ? (
                      <div className="otp-section">
                        <input
                          type='number'
                          placeholder="Enter OTP"
                          className="otp-input"
                          value={otpInput[x.period] || ""}
                          onChange={(e) => setOtpInput(prev => ({ ...prev, [x.period]: e.target.value }))}
                        />
                        <button
                          className="student-otp-button"
                          onClick={() => handleOtpSubmit(x.period, x.dept)}
                        >
                          Submit OTP
                        </button>
                      </div>
                    ) : (
                      <div className="status-badge waiting">
                        Waiting for OTP...
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-schedule">
              <p>No classes scheduled for today.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}



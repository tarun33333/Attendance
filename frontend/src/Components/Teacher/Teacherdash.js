import React, { useContext, useEffect, useState } from 'react';
import './styles.css';
import axios from 'axios';
import { Authcontext } from '../Auth';
import Navbar from './Navbar';

export default function TeacherDashboard() {
  const [date, setDate] = useState('');
  const { user } = useContext(Authcontext);
  const [schedule, setschedule] = useState([]);
  const [otps, setOtps] = useState([]);
  const [generatedOtp, setGeneratedOtp] = useState(null);

  //get day name from date
  function getDayName(dateString) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(dateString);
    return days[d.getDay()];
  }

  // Set today's date on first load
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  // Load schedule + OTPs when date or user changes  
  useEffect(() => {
    if (!date || !user) return;

    // Fetch teacher schedule
    axios.get(`${process.env.REACT_APP_BACKEND}/teacher/tdyschedule/${user["t-id"]}`)
      .then(res => {
        if (res.data.data) {
          setschedule(res.data.data.periods);
        } else {
          setschedule([]);
        }
      })
      .catch(err => {
        console.error("Error fetching schedule:", err);
      });
  }, [user, date]);

  useEffect(() => {
    // Fetch OTPs
    axios.get(`${process.env.REACT_APP_BACKEND}/otp/otps`).then(res => {
      setOtps(res.data.filter(o => o.teacher === user.name));
    });
  }, [generatedOtp, user.name]);

  // OTP Generator
  const otp = (e) => {
    const d = {
      ...e,
      teacher: user.name,
      "t-id": user["t-id"],
    };
    console.log("Generating OTP for:", d);
    axios.post(`${process.env.REACT_APP_BACKEND}/otp/otpgen`, d)
      .then(async (res) => {
        setGeneratedOtp(res.data.otp);
        alert(`OTP generated - ${res.data.otp}`);
      });
  };

  const getOtpForPeriod = (period, dept) => {
    const found = otps.find(o => o.period === period && o.dept === dept);
    return found ? found.otp : null;
  };

  return (
    <div className="teacher-dashboard">
      <Navbar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Welcome, {user.name}</h1>
            <p className="date-display">{date ? getDayName(date) : ''}, {date}</p>
          </div>
        </header>

        <section className="schedule-section">
          <h2 className="section-title">Your Schedule</h2>
          <div className="class-list">
            {schedule.length > 0 ? (
              schedule.map(x => {
                const otpValue = getOtpForPeriod(x.period, x.dept);
                return (
                  <div key={x["dept"] + x.period} className="class-card">
                    <div className="card-header">
                      <span className="period-badge">Period {x.period}</span>
                      <span className="dept-badge">{x.dept || '—'}</span>
                    </div>
                    <div className="card-body">
                      <h3 className="subject-title">{x.subject}</h3>

                      {otpValue ? (
                        <div className="otp-display">
                          <span className="otp-label">Active OTP</span>
                          <span className="otp-value">{otpValue}</span>
                        </div>
                      ) : (
                        // Allow OTP only if dept is not empty
                        x.dept && (
                          <button
                            onClick={() => otp({ period: x.period, dept: x.dept })}
                            className="generate-otp-button"
                          >
                            Generate OTP
                          </button>
                        )
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
        </section>
      </div>
    </div>
  );
}

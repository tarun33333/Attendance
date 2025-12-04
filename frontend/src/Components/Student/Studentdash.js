import React, { useContext, useEffect, useState } from 'react';
import { Authcontext } from '../Auth';
import axios from 'axios';
import './styles.css';

export default function Studentdash() {
  const { user } = useContext(Authcontext);
  const [schedule, setSchedule] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [otpInput, setOtpInput] = useState({});
  const [otps, setOtps] = useState([]);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];

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

    // Fetch OTPs for this class
    axios
      .get(`${process.env.REACT_APP_BACKEND}/otp/otps`)
      .then(res => {
        setOtps(res.data.filter(o => o.dept === user.classId));
      })
      .catch(err => console.error(err));
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

  if (!user) {
    return null;
  }

  return (
    <div className='student-dashboard'>
      <h1>Welcome, {user.name}!! ☺️</h1>
      <h2>Today's Schedule ({today})</h2>
      <div className="student-class-list">
        {schedule.map(x => {
          // OTP exists if there is any OTP for this class & period
          const otpForPeriod = otps.find(o =>
            o.dept === user.classId &&
            o.period === x.period
          );
          return (
            <div key={`${x.dept || 'cls'}-${x.period}`} className="student-class-card">
              <h3>{x.dept || x.subject}</h3>
              <h4>Period: {x.period}</h4>
              <h4>Subject: {x.subject}</h4>
              <h3>{x.teacher}</h3>
              {attendance[x.period] ? (
                <h4>Marked Present</h4>
              ) : otpForPeriod ? (
                <div>
                  <input
                    type='number'
                    value={otpInput[x.period] || ""}
                    onChange={(e) => setOtpInput(prev => ({ ...prev, [x.period]: e.target.value }))}
                  />
                  <button
                    className="student-otp-button"
                    onClick={() => handleOtpSubmit(x.period, x.dept)}
                  >
                    OTP
                  </button>
                </div>
              ) : (
                <div style={{ color: '#888' }}>No OTP generated yet</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}



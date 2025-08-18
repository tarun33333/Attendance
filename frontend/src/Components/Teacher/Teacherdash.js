import React, { useContext, useEffect, useState } from 'react';
import './styles.css';
import axios from 'axios';
import { Authcontext } from '../Auth';
import Navbar from './Navbar';

export default function TeacherDashboard() {
  const [date, setDate] = useState('');
  const {user} = useContext(Authcontext);
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
    if (!date || !user ) return;

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

  useEffect(()=>{
    // Fetch OTPs
    axios.get(`${process.env.REACT_APP_BACKEND}/otp/otps`).then(res => {
      setOtps(res.data.filter(o => o.teacher === user.name));
    });
  },[generatedOtp,user.name]);

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
    <div className="dashboard">
      <Navbar />
      <h2>Welcome, {user.name}! ☺️</h2>
      <div className="filters">
      </div>
      <h2>Schedule for {date ? getDayName(date) : ''}</h2>
      <div className="class-list">
        {schedule.map(x => {
          const otpValue = getOtpForPeriod(x.period, x.dept);
            return (
            <div key={x["dept"] + x.period} className="class-card">
              <h3>Dept: {x.dept || '—'}</h3>
              <h4>Period: {x.period}</h4>
              <h4>Subject:</h4><h3>{x.subject}</h3>

              {otpValue ? (
                <div className="otp">OTP: {otpValue}</div>
              ) : (
                // Allow OTP only if dept is not empty
                x.dept && (
                  <button
                    onClick={() => otp({ period: x.period, dept: x.dept })}
                    className="otp-button"
                  >
                    Generate OTP
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

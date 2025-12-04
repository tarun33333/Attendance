import React, { useContext, useEffect, useState } from 'react'
import Navbar from './Navbar'
import './styles.css'
import { Authcontext } from '../Auth'
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function View() {

  const { user } = useContext(Authcontext);
  const [msg, setmsg] = useState("");
  const [schedule, setschedule] = useState([]);
  const [students, setstudents] = useState([]);
  const [final, setfinal] = useState([]);
  const [attendance, setattendance] = useState([]);
  const [clas, setclas] = useState("")
  const [availableClasses, setAvailableClasses] = useState([]);
  const [date, setDate] = useState('');


  const formatDate = (inputDate) => {
    const [year, month, day] = inputDate.split('-'); // from yyyy-mm-dd
    return `${day}.${month}.${year}`; // backend expects dd.mm.yyyy
  };

  useEffect(() => {
    if (!date) return;
    axios.get(`${process.env.REACT_APP_BACKEND}/teacher/dateschedule/${user['t-id']}/${formatDate(date)}`)
      .then(res => {
        console.log(res.data.data);
        if (res.data.data.periods.length > 0) {

          const validPeriods = res.data.data.periods.filter(period => period.dept && period.dept.trim() !== "");

          setschedule(validPeriods);

          // Show Period number + Dept + Subject
          setAvailableClasses(validPeriods.map(period => ({
            value: period.dept,
            label: `Period ${period.period} - ${period.dept} - ${period.subject}`
          })));

          setmsg(res.data.msg);
        } else {
          setschedule([]);
          setmsg(res.data.msg);
        }
      })
      .catch(err => {
        console.log(err)
      })
  }, [clas, date])

  useEffect(() => {
    if (!clas || !date) return;
    axios.get(`${process.env.REACT_APP_BACKEND}/teacher/attendance/${clas}/${formatDate(date)}`)
      .then(res => {
        console.log(res.data.data);
        if (res.data.data.length > 0) {
          setstudents(res.data.data);
          setfinal(res.data.data);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, [clas, date]);





  const download = () => {
    const table = document.getElementById('atable');
    const workbook = XLSX.utils.table_to_book(table, { sheet: "Attendance" });
    XLSX.writeFile(workbook, `Attendance_${clas}.xlsx`);
  };

  return (
    <div className="teacher-dashboard">
      <Navbar />
      <div className="view-container">
        <div className="view-content">
          <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>Attendance View</h2>

          <div className="filters" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ marginRight: '0.5rem', fontWeight: 600 }}>Date: </label>
              <input
                type="date"
                value={date}
                onChange={e => { setDate(e.target.value); setclas(''); }}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>

            {availableClasses.length > 0 && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ marginRight: '0.5rem', fontWeight: 600 }}>Class: </label>
                <select
                  value={clas}
                  onChange={e => setclas(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', minWidth: '200px' }}
                >
                  <option value="">Select Class</option>
                  {availableClasses.map((cls, index) => (
                    <option key={index} value={cls.value}>
                      {cls.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {final.length > 0 ? (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table id="atable" className="attendance-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--accent-color)', color: 'white' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', borderRadius: '8px 0 0 8px' }}>Roll</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left', borderRadius: '0 8px 8px 0' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {final.map((stu, index) => (
                      <tr key={stu.id} style={{ borderBottom: '1px solid #eee', background: index % 2 === 0 ? 'rgba(255,255,255,0.5)' : 'transparent' }}>
                        <td style={{ padding: '1rem' }}>{stu.roll}</td>
                        <td style={{ padding: '1rem' }}>{stu.name}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            background: stu.status === 'Present' ? 'rgba(56, 161, 105, 0.1)' : 'rgba(229, 62, 62, 0.1)',
                            color: stu.status === 'Present' ? 'var(--success-color)' : 'var(--danger-color)',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}>
                            {stu.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={download}
                className="generate-otp-button"
                style={{ marginTop: '2rem', maxWidth: '200px' }}
              >
                Download Excel
              </button>
            </>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
              {date && clas ? "No attendance data found." : "Please select a date and class to view attendance."}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

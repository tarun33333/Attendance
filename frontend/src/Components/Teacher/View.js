import React, { useContext, useEffect, useState } from 'react'
import Navbar from './Navbar'
import './styles.css'
import { Authcontext } from '../Auth'
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function View() {

    const {user}=useContext(Authcontext);
    const[msg,setmsg]=useState("");
    const[schedule,setschedule]=useState([]);
    const[students,setstudents]=useState([]);
    const[final,setfinal]=useState([]);
    const[attendance,setattendance]=useState([]);
    const[clas,setclas]=useState("")
    const[availableClasses, setAvailableClasses] = useState([]);
    const[date, setDate] = useState('');

   
    const formatDate = (inputDate) => {
        const [year, month, day] = inputDate.split('-'); // from yyyy-mm-dd
        return `${day}.${month}.${year}`; // backend expects dd.mm.yyyy
    };

    useEffect(()=>{
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
    },[clas, date])

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
  <div className="dashboard">
    <Navbar />
    <div className="filters">
      <label>Date: </label>
      <input type="date" value={date} onChange={e => { setDate(e.target.value); setclas(''); }} />
          {availableClasses.length > 0 && (
          <>        
                    <label style={{ marginLeft: 10 }}>Class: </label>
                    <select value={clas} onChange={e => setclas(e.target.value)}>
                    {availableClasses.map((cls, index) => (
                       <option key={index} value={cls.value}>
                           {cls.label}
                       </option>
              ))}
            </select>
         </>
        )}
    </div>
    <h2>Attendance View</h2>
    <table id="atable" className="attendance-table">
      <thead>
        <tr>
          <th>Roll</th>
          <th>Name</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {final.map(stu => (
          <tr key={stu.id}>
            <td>{stu.roll}</td>
            <td>{stu.name}</td>
            <td>{stu.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <button onClick={download}>Download Excel</button>
  </div>
)
}

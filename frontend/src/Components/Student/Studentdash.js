import React, { useContext, useEffect, useState } from 'react'
import Auth, { Authcontext } from '../Auth'
import axios from 'axios'
import './styles.css';

export default function Studentdash() {

    const[data,setdata]=useState([])
    const{user,login,logout}=useContext(Authcontext)
    const[attendence,setattendence]=useState({"1":false ,"2":false,"3":false,"4":false,"5":false,'6':false,"7":false})
    const[otpgen,setotpgen]=useState()
    const[otpdet,setotpdet]=useState("")
    const [otps, setOtps] = useState([])
    // Get today's day name (Monday-Saturday)
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const today = days[new Date().getDay()];
    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    useEffect(() => {
        axios.get("http://localhost:3001/class-schedules")
            .then(res => {
                const s = res.data.find(x => x.classId == user[0].classId)
                if (s && s.week && validDays.includes(today)) {
                    const foundDay = s.week.find(d => d.day === today);
                    setdata(foundDay ? foundDay.schedule : []);
                } else {
                    setdata([]);
                }
            })
        // Fetch OTPs for this class
        axios.get("http://localhost:3001/otp").then(res => {
            setOtps(res.data.filter(o => o.dept === user[0].classId));
        });
    }, [user, today])

    // useEffect(()=>{
    //   axios.get("http://localhost:3001/otp")
    //   .then(res =>{
    //     const sen=res.data.find(i => i.classId === x.dept );

    //   })
    // })

    const handleotpdet=(x)=>{
      axios.get("http://localhost:3001/otp")
      .then(res =>
      {
        const sen=res.data.find(i => i.classId === x.dept && i.period === x.period);
        if(!sen){
            alert("Wrong OTP")
            return
        }
        if(sen.otp === otpdet){
          setattendence(prev => ({...prev,[sen.period]:true}))

          const today = new Date().toISOString().split('T')[0];
          const dataatt={
            studentId: user[0].id,
            name: user[0].name,
            classId: user[0].classId,
            period: x.period,
            status: "Present",
            staff: sen.teacher,
            date: today
          }
          axios.post("http://localhost:3001/attendance",dataatt);
          // Delete OTP after use
          axios.get("http://localhost:3001/otp").then(otpRes => {
            const otpToDelete = otpRes.data.find(i => i.dept === x.dept && i.period === x.period);
            if (otpToDelete) {
              axios.delete(`http://localhost:3001/otp/${otpToDelete.id}`);
            }
          });
        }
        else{
          alert("Wrong Password")
        }
      }
      )

      
    }
  return (
    <div className='student-dashboard'>
       <h1>Welcome, {user[0].name}!! ☺️</h1>
       <h2>Today's Schedule ({today})</h2>
       <div className="student-class-list">
          {data.map(x => {
           // Find OTP for this class (dept), period, and teacher
           const otpForPeriod = otps.find(o =>
             o.dept === user[0].classId &&
             o.period === x.period &&
             o.teacher === x.teacher
           );
           return (
             <div key={x.period} className="student-class-card">
               <h3>{x.dept || x.subject}</h3>
               <h4>Period: {x.period}</h4>
               <h4>Subject: {x.subject}</h4>
               <h3>{x.teacher}</h3>
               {attendence[x.period] ? <h4>Marked Present</h4>:
                 otpForPeriod ? (
                    <div>
                     <input type='number' onChange={(e)=> setotpdet(e.target.value)}/>
                      <button className="student-otp-button" onClick={()=>handleotpdet({period:x.period,dept:x.dept})}>OTP</button>
                   </div>
                 ) : (
                   <div style={{color: '#888'}}>No OTP generated yet</div>
                 )
               }
             </div>
           )
         })}
       </div>
    </div>
  )
}

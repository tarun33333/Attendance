import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Auth, { Authcontext } from '../Auth';
import './styles.css';

export default function Logins() {
    const[det,setdet]=useState({email:"",password:""});
    const[db,setdb]=useState([])
    const navi=useNavigate();
    const{user,login,logout}=useContext(Authcontext)
    const handlechange=(e)=>{
        const{name,value}=e.target;
        setdet(pre=>({...pre,[name]:value}))
    }

    useEffect(()=>{
        axios.get("http://localhost:3001/students")
        .then(res => {
            setdb(res.data);
    })
        .catch(err => console.log(err))
  },[])

    const handlelogin=(t)=>{
         t.preventDefault();
        const found= db.filter(x=>x.email===det.email && x.password===det.password)
        if(found.length !== 0){
          login(found)
          console.log(found)
          navi('/studentdash')
        }
        else{
          alert("invalid user and password")
        }
    }


  return (
    <div className='student-login-page'>
       <form className='student-login-form' onSubmit={handlelogin}>
       <h1>Student Login</h1>
           <label className='student-login-label'>Username</label>
           <input type='email' value={det.email} placeholder='abc@gmail.com' name="email" onChange={handlechange} /><br />
           <label className='student-login-label'>Password</label>
           <input type='password' value={det.password} placeholder='password' name="password" onChange={handlechange} /><br />
           <button type='submit' className='student-login-button'>Submit</button>
           <p><Link to='/teacher'>Are you Teacher?</Link></p>
       </form>
    </div>
  )
}

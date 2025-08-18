import React, { useContext, useEffect, useState } from 'react'
import './styles.css';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Authcontext } from '../Auth';

export default function LoginT() {

    const[det,setdet]=useState({email:"",password:""});

    const[msg,setmsg]=useState("");
    const[loading,setloading]=useState(false);

    const navi=useNavigate();
    const {login}=useContext(Authcontext);

    const handlechange=(e)=>{

        const{name,value}=e.target;

        setdet(pre=>({...pre,[name]:value}))
    }

    

    const handlelogin=(t)=>{
        t.preventDefault();
        axios.post(`${process.env.REACT_APP_BACKEND}/teacher/login`,det)
        .then((res)=>{
            setmsg(res.data);
            if(res.status === 200){
                login(res.data.user);
                setmsg(res.data.msg);
                navi('/teacherdash');
            } else {
                alert(res.data.msg);
            }
        })
    }

  
  return (
    <div className='mainbody'>

    
    <div className='loginpage' >
      <h1>Staff Login</h1>
      <form className='login' onSubmit={handlelogin}>
        <label className=''>Username</label>
        <input type='email' value={det.email} placeholder='abc@gmail.com' name="email" onChange={(e)=>handlechange(e)}/><br></br>
        <label className=''>Password</label>
        <input type='password' value={det.password} placeholder='password' name="password" onChange={(e)=>handlechange(e)}/><br></br>
        <button type='submit' className='butsub'>Submit</button>
      </form><br></br>
        <p><Link to='/'>Are you Student?</Link></p>
        <h4>{msg}</h4>
    </div>
    </div>
  )
  
}

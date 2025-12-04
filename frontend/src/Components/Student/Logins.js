import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Authcontext } from '../Auth';
import './styles.css';

export default function Logins() {
  const [det, setDet] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(Authcontext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDet((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    axios
      .post(`${process.env.REACT_APP_BACKEND}/student/login`, det)
      .then((res) => {
        if (res.status === 200 && res.data.user) {
          login(res.data.user);
          setMsg(res.data.msg || "Login successful");
          navigate('/studentdash');
        } else {
          setMsg(res.data.msg || "Invalid email or password");
        }
      })
      .catch((err) => {
        console.error(err);
        setMsg(err.response?.data?.msg || "Login failed");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className='student-login-page'>
      <form className='student-login-form' onSubmit={handleLogin}>
        <h1>Student Login</h1>
        <label className='student-login-label'>Username</label>
        <input
          type='email'
          value={det.email}
          placeholder='abc@gmail.com'
          name="email"
          onChange={handleChange}
          required
        />
        <label className='student-login-label'>Password</label>
        <input
          type='password'
          value={det.password}
          placeholder='password'
          name="password"
          onChange={handleChange}
          required
        />
        <button type='submit' className='student-login-button' disabled={loading}>
          {loading ? "Logging in..." : "Submit"}
        </button>
        {msg && <p style={{ marginTop: 10, color: '#c00' }}>{msg}</p>}
        <p><Link to='/teacher'>Are you Teacher?</Link></p>
      </form>
    </div>
  );
}

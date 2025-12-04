import React, { useContext, useState } from 'react'
import './styles.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Authcontext } from '../Auth';

export default function LoginT() {

  const [det, setdet] = useState({ email: "", password: "" });
  const [msg, setmsg] = useState("");
  const [loading, setloading] = useState(false);

  const navi = useNavigate();
  const { login } = useContext(Authcontext);

  const handlechange = (e) => {
    const { name, value } = e.target;
    setdet(pre => ({ ...pre, [name]: value }))
  }

  const handlelogin = (t) => {
    t.preventDefault();
    setloading(true);
    setmsg("");

    axios.post(`${process.env.REACT_APP_BACKEND}/teacher/login`, det)
      .then((res) => {
        if (res.status === 200) {
          login(res.data.user);
          setmsg(res.data.msg || "Login successful");
          navi('/teacherdash');
        } else {
          setmsg(res.data.msg || "Login failed");
        }
      })
      .catch(err => {
        console.error(err);
        setmsg(err.response?.data?.msg || "Login failed");
      })
      .finally(() => setloading(false));
  }

  return (
    <div className='loginpage'>
      <div className='login-container'>
        <h1>Staff Login</h1>
        <form className='login-form' onSubmit={handlelogin}>
          <div className="form-group">
            <input
              type='email'
              value={det.email}
              placeholder='Enter your email'
              name="email"
              onChange={handlechange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type='password'
              value={det.password}
              placeholder='Enter your password'
              name="password"
              onChange={handlechange}
              required
            />
          </div>

          {msg && <p className="error-message" style={{ color: '#e53e3e', marginBottom: '1rem' }}>{msg}</p>}

          <button type='submit' className='butsub' disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
          Are you a Student? <Link to='/' style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Login here</Link>
        </p>
      </div>
    </div>
  )
}

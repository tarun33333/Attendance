import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import './styles.css'
import { Authcontext } from '../Auth'
export default function Navbar() {

  const{logout}=useContext(Authcontext);
  return (
    <div>
      <nav className="navbar">
        <NavLink to='/teacherdash' className={({ isActive }) => isActive ? 'active-link' : ''}>Dashboard</NavLink>
        <NavLink to='/view' className={({ isActive }) => isActive ? 'active-link' : ''}>View</NavLink>
        <NavLink to='/Profile' className={({ isActive }) => isActive ? 'active-link' : ''}>Profile</NavLink>
        <NavLink to='/' onClick={logout} className={({ isActive }) => isActive ? 'active-link' : ''}>Logout</NavLink>
      </nav>
    </div>
  )
}

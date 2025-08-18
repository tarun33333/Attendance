import React, { useContext, useEffect, useState } from 'react';
import './styles.css';
import Navbar from './Navbar';
import { Authcontext } from '../Auth';


export default function Profile() {

  const {user}=useContext(Authcontext);
 

  return (
        <div className="dashboard">
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <h2>Teacher Profile</h2>
          {user ? (
            <div className="profile-info">
              <p><strong>ID:</strong> {user["t-id"]}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          ) : (
            <p>Loading profile...</p>
          )}
        </div>
      </div>
    </div>
  )
}

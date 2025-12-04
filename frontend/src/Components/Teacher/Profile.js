import React, { useContext } from 'react';
import './styles.css';
import Navbar from './Navbar';
import { Authcontext } from '../Auth';


export default function Profile() {

  const { user } = useContext(Authcontext);


  return (
    <div className="teacher-dashboard">
      <Navbar />
      <div className="profile-container">
        <div className="profile-content">
          <h2 className="section-title" style={{ color: 'var(--text-primary)', textAlign: 'center' }}>Teacher Profile</h2>
          {user ? (
            <div className="profile-info" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', marginTop: '2rem' }}>
              <div className="user-avatar" style={{ width: '100px', height: '100px', fontSize: '3rem', margin: '0 auto' }}>
                {user.name.charAt(0)}
              </div>

              <div style={{ width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.5)', padding: '2rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>ID</span>
                  <span style={{ fontWeight: 600 }}>{user["t-id"]}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Name</span>
                  <span style={{ fontWeight: 600 }}>{user.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Email</span>
                  <span style={{ fontWeight: 600 }}>{user.email}</span>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center' }}>Loading profile...</p>
          )}
        </div>
      </div>
    </div>
  )
}

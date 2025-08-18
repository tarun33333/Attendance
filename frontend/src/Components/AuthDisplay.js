import React, { useContext } from 'react'
import { Authcontext } from './Auth'
import { Navigate } from 'react-router-dom'

export default function AuthDisplay(props) {

    const data=useContext(Authcontext)

    if(!data.user){
        return <Navigate to="/"/>
    }
  return (
    <div>
      {props.children}
    </div>
  )
}

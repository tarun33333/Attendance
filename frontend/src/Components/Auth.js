import React, { useState } from 'react'


export const Authcontext=React.createContext();

export default function Auth(props) {

    const[user,setuser]=useState({});

    const login=(user)=>{
        setuser(user);

    }

    const logout=()=>{
        setuser(null);
    }

  return (
    <div>
      <Authcontext.Provider value={{user,login,logout}}>
        {props.children}
      </Authcontext.Provider>
    </div>
  )
}

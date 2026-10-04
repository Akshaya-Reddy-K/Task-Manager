import React from 'react'
import { useState } from 'react'
import "./App.css"
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const [username,setUser]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("")

    const navigate = useNavigate();

   const handleLogin = async () => {  
    try {
      const response = await axios.post("http://localhost:3000/login",{ username, password });
      
      if (response.data.success) {
        localStorage.setItem("token",response.data.token );
        navigate(`/task`);
      }
    } catch (err) {
       setError(err.response?.data?.message || "Login Failed");
    }
  };

  return (
        <div className='box'>
            <h3 >Login</h3>
            <input className="inputbox" type='text' value={username} onChange={(e)=>{setUser(e.target.value)}} placeholder='UserName'/>
            <input  className='inputbox' type="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} placeholder='Password'/>
            <button className="link" onClick={handleLogin}>Login</button>
            <p>New User ? <a className="link" href="/signin">Signin</a></p>

            {error && <p style={{color:"red"}}>{error}</p>}
        </div>
  )
}

export default Login
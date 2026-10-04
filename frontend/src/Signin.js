import React, { use, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./App.css"

function Signin() {
    const [username,setUser]=useState("");
    const [pswd,setPswd]=useState("");
    const[cpswd,setCpswd]=useState("");
    const [error,setError]=useState("")

    const navigate=useNavigate();

    const handleSignin= async()=>{
      try{
        const res= await axios.post("http://localhost:3000/signin",{username,pswd,cpswd});
        if(res.data.success)
        {
          localStorage.setItem("token",res.data.token);
          navigate(`/task`);
        }
      }
      catch(err)
      {
        setError(err.response?.data?.message);
      }
    }

  return (
    <div className='box'>
       <h3>Signin</h3>
       <input className="inputbox" type="text" placeholder='UserName' onChange={(e)=>{setUser(e.target.value)}} />
       <input type="password" className='inputbox' placeholder='Password' onChange={(e)=>{setPswd(e.target.value)}} />
       <input type="password" className='inputbox' placeholder='Confirm Password' onChange={(e)=>{setCpswd(e.target.value)}} />
       <button className='link'  onClick={handleSignin}>Signin</button>
       {error && <p style={{color:"red"}}>{error}</p>}
    </div>
  )
}

export default Signin;

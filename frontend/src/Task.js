import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams,Link } from 'react-router-dom';
import "./App.css"
import Profile from "./Profile.png"

function Task() {
  const [task, setTask] = useState("");
  const [list, setList] = useState([]);
  const { filter } = useParams();
  const token=localStorage.getItem("token");
  let duplicate=list;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://localhost:3000/task",{headers:{Authorization: `Bearer ${token}`}});
        setList(res.data.tasks);
      } catch (err) {
        alert(err.response?.data?.message || "Error fetching tasks");
      }
    };
    fetchTasks();
  },[token]);

 const handleAdd = async () => {
  if (task.trim() === "") {
    alert("Username and task are required");
    return;
  }

  try {
    const res = await axios.post("http://localhost:3000/task", {task },{headers:{Authorization:`Bearer ${token}`}});
    if (res.data.success) {
      setList(prev => [...prev, res.data.task]);
      setTask("");
    }
  } catch (err) {
    alert(err.response?.data?.message || "Error adding task");
  }
};

const handleChange=async(id,com)=>{
  try{
    await axios.post("http://localhost:3000/completed",{id,com},{headers:{Authorization:`Bearer ${token}`}});
    setList((prevList) =>prevList.map((item) => item._id === id ? { ...item, completed: com } : item ));
  }
  catch(err)
  {
    alert(err.response?.data?.message);
  }
}

const handleRemove = async (id) => {
  try {
    await axios.post("http://localhost:3000/delete", {id },{headers:{Authorization:`Bearer ${token}`}});
    setList(prev => prev.filter(t => t._id !== id));
  } catch (err) {
    alert(err.response?.data?.message || "Error deleting task");
  }
};

if(filter==="Completed"){
  duplicate=list.filter(item=>item.completed==true);
}
else if(filter==="Upcoming"){
    duplicate=list.filter(item=>item.completed==false);
}
else{
  duplicate=list;
}


  return (
    <div className="container">

      <div className="menu">
        <div className='profile'>
            <img src={Profile} alt="profile"/>
        </div>
        <Link to='/task/All'>ALL Tasks</Link>
        <Link to='/task/Completed'>Completed</Link>
        <Link to='/task/Upcoming'>Upcoming</Link>
        <div className='logout'>
          <Link to="/logout">Logout</Link>
        </div>
      </div>

      <div className='main'>
        <h3 className='text'>Task Manager</h3>

        <div className='flex'>
          <input
            className='inputbox'
            type="text"
            placeholder='Enter the Task'
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <button className='button' onClick={handleAdd}>ADD</button>
        </div>

        <div className='items'>
          {duplicate.map((t) => (
            <div key={t._id} className="item">
              <input type="checkbox" checked={t.completed} onChange={()=>handleChange(t._id,!t.completed)} />
              { t.task}
              <button onClick={() => handleRemove(t._id)}>X</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Task;

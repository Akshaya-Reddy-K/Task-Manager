import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./Login";
import Signin from "./Signin";
import Task from "./Task";
import Logout from "./Logout";

function App() {

  return (
    <Router>
      <div className="center">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/task" element={<Task/>} />
            <Route path="/task/:filter" element={<Task/>}/>
            <Route path="/logout" element={<Logout/>}></Route>
          </Routes>
      </div>
    </Router>
  );
}

export default App;

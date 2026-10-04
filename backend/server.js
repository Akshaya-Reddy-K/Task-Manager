const cors=require("cors");
const express=require("express");
const mongoose=require("mongoose");
const User=require("./user.js");
const Task=require("./task.js");
const jwt=require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to Database"))
  .catch(() => console.log("Database connection failed"));


function create(usr){
    const token=jwt.sign({username:usr},process.env.JWT_SECRET,{expiresIn:"1h"});
    return token;
}

function verify(req,res,next){
    const authHeader=req.headers.authorization;

    console.log(authHeader);

    if(!authHeader)
    {
      return res.status(401).json({message:"No Token"});
    }

    const token=authHeader.split(" ")[1];

    try{
      const decode=jwt.verify(token,process.env.JWT_SECRET); 
      req.username=decode.username;
      next();
    }
    catch(err){
      res.status(401).json({message:"Invalid Token"});
    }
}

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const usr = await User.findOne({ username });
    if (!usr) return res.status(404).json({ success: false, message: "User not found" });
    if (usr.password !== password) return res.status(401).json({ success: false, message: "Incorrect password" });
    
    const token=create(usr.username)
    res.json({ success: true, message: "Login successful",token});
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/signin", async (req, res) => {
  const { username, pswd, cpswd } = req.body;

  if (pswd !== cpswd) return res.status(400).json({ success: false, message: "Password and Confirm Password do not match" });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(409).json({ success: false, message: "User already exists" });

    const newUser = new User({ username, password: pswd });
    await newUser.save();
    const token=create(username);
    res.status(201).json({ success: true, message: "User registered successfully" ,token});
  } catch (err) {
    console.error("Signin Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/task",verify, async (req, res) => {
  const {task } = req.body;
  const username=req.username;

  if (!username || !task) return res.status(400).json({ success: false, message: "Username and task are required" });

  try {
    const newTask = new Task({ username, task });
    const savedTask = await newTask.save();
    res.json({ success: true, task: savedTask });
  } catch (err) {
    console.error("Add Task Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.post("/delete",verify, async (req, res) => {
  const {id } = req.body;
  const username=req.username;
  try {
    const result=await Task.deleteOne({ username, _id:id });

    if(result.deletedCount === 0)
    {
      return res.status(404).json({success:false,message:"Task not found"});
    }

    res.json({success:true,message:"Task deleted"});
  } catch (err) {
    console.error("Delete Task Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get("/task",verify, async (req, res) => {
  const username=req.username;
  try {
    const tasks = await Task.find({ username });
    res.json({ success: true, tasks });
  } catch (err) {
    console.error("Get Task Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.post("/completed",verify,async(req,res)=>{
  const {id,com}=req.body;
  const username=req.username;  
  try{
      await Task.updateOne({username:username,_id:id},{$set:{completed:com}});
      res.json({ success: true});
  } catch (err) {
    console.error("Get Task Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
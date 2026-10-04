const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  task: { type: String, required: true, trim: true },
  completed:{type:Boolean,default:false}
});

module.exports = mongoose.model("tasks", TaskSchema);

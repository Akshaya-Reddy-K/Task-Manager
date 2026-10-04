const mongoose=require("mongoose");

const userSchema=new mongoose.Schema(
   {
     username:{type:String,unique:true,trim:true,required:true},
     password:{type:String,required:true}
    }
);

module.exports=mongoose.model("user",userSchema);
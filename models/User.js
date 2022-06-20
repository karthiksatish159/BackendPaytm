const mongoose=require('mongoose');
const schema=mongoose.Schema;
const userSchema=new schema(
    {
        username:String,
        email:String,
        coins:Number
    });
module.exports=mongoose.model('User',userSchema);
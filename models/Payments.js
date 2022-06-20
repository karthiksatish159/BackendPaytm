const mongoose=require('mongoose');
const schema=mongoose.Schema;
const paymentSchema = new schema({
    username:String,
    email:String,
    contact:String,
    companyName:String,
    amount:Number,
    order_id:String,
    payment_id:String,
    date: {type:Date,default:Date.now},
    status:String,
  });
  module.exports=mongoose.model('payments',paymentSchema);

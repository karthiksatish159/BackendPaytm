const express=require('express');
const router=express.Router();
const User=require('../models/User');
router.get("/:email",(req,res)=>
{
    User.findOne({email:req.params.email})
    .then((person)=>
    {
        // console.log(person);
        if(person)
        {
            res.send(`The balance is ${person.coins} coins`);
        }
        else
        {
            res.send(`The user doesnot exits`);
        }
    })
    .catch((e)=>console.log(e));
   
});
module.exports=router;
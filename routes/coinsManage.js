const express=require('express');
const router=express.Router();
const User=require('../models/User');
router.get("/addCoins/:coin/:email",(req,res)=>
{
    console.log(`This is the ${req}`);
	User.findOne({email:req.params.email})
	.then((person)=>
	{
		if(person)
		{
			person.coins+=parseInt(req.params.coin);
			person.save()
			.then((obj)=>
			{
				res.render('paymentSuccess',{message:`Your ${req.params.coin} is added and the total coins you have ${obj.coins}`});
			})
			.catch((e)=>console.log(e));
		}
		else
		{
			var newPerson=new User(
			{
				username:req.params.email.substring(0,7),
				email:req.params.email,
				coins:req.params.coin
			})
			newPerson.save()
			.then((person)=>
			{
				if(person)
				{
		
					res.render('paymentSuccess',{message:`Welcome ${email}  Your ${req.params.coin} is added and the total coins you have ${person.coins}`});
				}
			})
			.catch((e)=>console.log(e));
		}
	})
	.catch((e)=>console.log(e));
    //res.send(`Your coins ${req.params.coin} is added`);
})
module.exports=router;
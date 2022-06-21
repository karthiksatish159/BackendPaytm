const express = require("express");
const https = require("https");
const qs = require("querystring");
const checksum_lib = require("./Paytm/checksum");
const config = require("./Paytm/config");
const app = express();
const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });
const db=require('./config_Node/keyUrl').url;
const mongoose=require('mongoose');
const pay=require('./routes/paytmN');
const PORT = process.env.PORT || 4000;
const payment=require('./models/Payments');
const user=require('./models/User');
const coins=require('./routes/coinsManage');
const balance=require('./routes/getBalance');
app.set('view engine', 'ejs');
app.use(express.static("public"));
//Connection with mongodb
mongoose.connect(db,{useNewUrlParser:true})
.then(()=>console.log(`The mongo connected`))
.catch((e)=>console.log(e));
app.get('/',(req,res)=>
{
  res.render('index',{coins:req.params.coin});
})
app.get("/:coin", (req, res) => {
  res.render('index',{coins:req.params.coin});
});
app.use("/pay",pay);
app.use("/coins",coins);
app.use("/viewBalance",balance);
app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});
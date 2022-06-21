const express=require('express');
const https = require("https");
const qs = require("querystring");
const router=express.Router();
const checksum_lib = require("../Paytm/checksum");
const config = require("../Paytm/config");
const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });
const payment=require('../models/Payments');
var paymentDetails={
  amount:"",
  customerId:"",
  customerEmail:"",
  customerPhone:""
};
router.post('/paynow',[parseUrl, parseJson],(req,res)=>
{
    let conversion=parseInt(req.body.amount)*10;
    let value="";
    value=conversion.toString();
    //Dont confuse the name of attribute is amount but it will take the 
    console.log(value);
    paymentDetails.amount=value;
    paymentDetails.customerId=req.body.name;
    paymentDetails.customerEmail=req.body.email;
    paymentDetails.customerPhone=req.body.phone;
    if(!paymentDetails.amount || !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
         res.status(400).send('Payment failed')
     } else {
         var params = {};
         params['MID'] = config.PaytmConfig.mid;
         params['WEBSITE'] = config.PaytmConfig.website;
         params['CHANNEL_ID'] = 'WEB';
         params['INDUSTRY_TYPE_ID'] = 'Retail';
         params['ORDER_ID'] = 'TEST_'  + new Date().getTime();
         params['CUST_ID'] = paymentDetails.customerId;
         params['TXN_AMOUNT'] =paymentDetails.amount;
         params['CALLBACK_URL'] = 'https://paytmgatewayholo.herokuapp.com/pay/callback';
         params['EMAIL'] =paymentDetails.customerEmail;
         params['MOBILE_NO'] =paymentDetails.customerPhone;
     
     
         checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
             var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
             // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production
     
             var form_fields = "";
             for (var x in params) {
                 form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
             }
             form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";
     
             res.writeHead(200, { 'Content-Type': 'text/html' });
             res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
             res.end();
         });
      }
})

//callback

router.post("/callback", (req, res) => {
    // Route for verifiying payment
  
    var body = '';
  
    req.on('data', function (data) {
       body += data;
    });
  
     req.on('end', function () {
       var html = "";
       var post_data = qs.parse(body);
  
       // received params in callback
       console.log('Callback Response: ', post_data, "\n");
  
  
       // verify the checksum
       var checksumhash = post_data.CHECKSUMHASH;
       // delete post_data.CHECKSUMHASH;
       var result = checksum_lib.verifychecksum(post_data, config.PaytmConfig.key, checksumhash);
       console.log("Checksum Result => ", result, "\n");
  
  
       // Send Server-to-Server request to verify Order Status
       var params = {"MID": config.PaytmConfig.mid, "ORDERID": post_data.ORDERID};
  
       checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
  
         params.CHECKSUMHASH = checksum;
         post_data = 'JsonData='+JSON.stringify(params);
  
         var options = {
           hostname: 'securegw-stage.paytm.in', // for staging
           // hostname: 'securegw.paytm.in', // for production
           port: 443,
           path: '/merchant-status/getTxnStatus',
           method: 'POST',
           headers: {
             'Content-Type': 'application/x-www-form-urlencoded',
             'Content-Length': post_data.length
           }
         };
  
  
         // Set up the request
         var response = "";
         var post_req = https.request(options, function(post_res) {
           post_res.on('data', function (chunk) {
             response += chunk;
           });
  
           post_res.on('end', function(){
             console.log('S2S Response: ', response, "\n");
  
             var _result = JSON.parse(response);
               if(_result.STATUS == 'TXN_SUCCESS') 
               {
                    // console.log(uname);
                    // console.log(email);
                   var newTrans=new payment(
                    {
                        username:paymentDetails.customerId,
                        email:paymentDetails.customerEmail,
                        contact:paymentDetails.customerPhone,
                        companyName:"Holoworld",
                        amount:paymentDetails.amount,
                        order_id:_result.ORDERID,
                        payment_id:_result.TXNID,
                        date:Date.now(),
                        status:"Success"

                    })
                    newTrans.save().then((newObj)=>
                    {
                        let conversion=parseInt(paymentDetails.amount);
                        conversion=conversion/10;
                        let value=conversion.toString();
                        var coins_=value;
                        if(newObj)
                        {
                            if(typeof coins_==='undefined')
                            {
                              res.render('paymentSuccess',{message:`The amount is ${newTrans.amount}`});
                            }
                            else
                            {
                              res.redirect(`/coins/addCoins/${coins_}/${paymentDetails.customerEmail}`);
                            }
                        }
                        else
                        {
                            res.send("Error");
                        }
                    }).catch((err)=>{console.log(err)});
               }
               else 
               {
                   res.send('payment failed')
               }
             });
         });
  
         // post the data
         post_req.write(post_data);
         post_req.end();
        });
       });
  });
module.exports=router;

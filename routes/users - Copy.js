var express = require('express'),
  aws = require('aws-sdk'),
 bodyParser = require('body-parser');
var multer = require('multer');
const request=require('request');
var extrafunction = require('../function.js');
//const upload=multer({dest:"uploads/"})
// to save data
const User=require('../Model/usermodel');
const Game=require('../Model/gamemodel');
const Topic=require('../Model/topicmodel');
const router=express.Router();
// define s3 bucket
var s3 = new aws.S3();
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null,file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});
// var upload = multer({dest:'uploads/'});
// loginsocial api
// post  request  to login  register new user
    //use by upload form

router.post('/register',upload.single('pic'),function(req,res,next){
  //console.log(req.file.originalname);
  console.log(req.body);
   //console.log(req.files);
  var data=req.body.data;
  var s_type=data.s_type;
    //social type are gmail, email , fb
    req.body.data.coin=10;
    req.body.data.d_id=req.body.d_id;
    req.body.data.app_ver=req.body.app_ver;
    req.body.data.show_ads="y";
    req.body.data.status="a";
    if ((s_type=="f") || (s_type=="g")) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      if ((data.s_id) && (data.s_type)) {
        User.findOne({s_id:req.body.data.s_id}).then(function(userdata){
          if(userdata)
          {
                res.send({"status":true,"code":200,"message":"Login Success","data":userdata,"show_ads":userdata.show_ads});
          }
          else {
            //  new social user
            // add 10 w_coin
            extrafunction.generateRefferalcode(data.name, function(r_code){
            //  console.log(r_code);
                req.body.data.r_code=r_code;
                User.create(req.body.data).then(function(newuser){
                    // when user registration done
                    // create user refferal code
                    res.send({"status":true,"code":200,"message":"New User Register","data":newuser});

                }).catch(next);
              });
          }
        });
      }
      else {
            res.send({"status":false,"code":404,"message":"Social id is Required"});
      }

    } else if(s_type=="m")
    {
      if (data.mobile) {
            //console.log(req.file.originalname);

            User.findOne({mobile:data.mobile}).then(function(userdata){
              if(userdata)
              {
                  res.send({"status":true,"code":200,"message":"Login Success","data":userdata,"show_ads":userdata.show_ads});
              }
              else
              {
                // new user

                extrafunction.generateRefferalcode(data.name, function(r_code){
                //  console.log(r_code);
                    req.body.data.r_code=r_code;
                    //    req.body.data.pic="https://s3.ap-south-1.amazonaws.com/profiletrackerweb/"+req.file.originalname;
                    if(req.file)
                    {
                      req.body.data.pic=req.file.originalname;
                    }else {
                      req.body.data.pic='';
                    }

                    User.create(req.body.data).then(function(newuser){
                        // when user registration done
                        // create user refferal code
                        res.send({"status":true,"code":200,"message":"New User Register","data":newuser});

                    }).catch(next);
                  });
              }
            });
      }
      else {
          res.send({"status":false,"code":404,"message":"Mobile No is Required"});
      }


    } else {
          res.send({"status":false,"code":404,"message":"invalid Social Type"});
    }
    // send user mail

});
router.post('/editprofile',upload.single('pic'),function(req,res,next){
    var data=req.body.data;
    if(data.user_id)
    {
      User.findOne({_id:data.user_id}).then(function(userdata){
              if (userdata) {
                if(req.file)
                {
                    userdata.pic=req.file.originalname;
                }
                if(data.gender)
                {
                  userdata.gender=data.gender;
                }
                if(data.dob)
                {
                  userdata.dob=data.dob;
                }
                if(data.email)
                {
                  userdata.email=data.email;
                }
                if(data.mobile)
                {
                  userdata.mobile=data.mobile;
                }
                if(data.country)
                {
                  userdata.country=data.country;
                }
                User.updateOne(
                     {_id:data.user_id},
                      userdata,
                       function(err, result){
                         //  console.log(result);
                         if (err) {
                             res.send({"status":false,"code":404,"message":"Something Went Wrong"});
                         }
                        else {
                            res.send({"status":true,"code":200,"message":"User Data updated"});
                        }
                       }
                   )
              }
              else {
                  res.send({"status":false,"code":404,"message":"Invalid Access"});
              }
          });

    }
    else {
          res.send({"status":false,"code":404,"message":"Required Parameter missing"});
    }
});
router.post('/homescreen',function(req,res,next){
//  console.log(req.body);
  // show all feature game & topic with user coin
    if (req.body.data.user_id) {
      User.findOne({_id:req.body.data.user_id}).select({_id:-1,coin:-1}).then(function(userdata){
        console.log(userdata);
      // topic data
        Topic.find({}).select({_id:-1,t_name:-1,img:-1}).then(function(topicdata){
          //console.log(topicdata);
          Game.find({}).then(function(gamedata){
            //console.log(topicdata);
              res.send({"status":true,"code":200,"message":"Data found","topic":topicdata,"game":gamedata,"coin":userdata.coin});
          });

        });
      });


    }else {
        res.send({"status":false,"code":404,"message":"Required Parameter missing"});
    }
});
module.exports=router;

var express = require('express'),
 bodyParser = require('body-parser');
 var AWS = require('aws-sdk'),
   multer = require('multer');
  multerS3 = require('multer-s3');
const request=require('request');
var extrafunction = require('../function.js');
//const upload=multer({dest:"uploads/"})
// to save data
const User=require('../Model/usermodel');
const Game=require('../Model/gamemodel');
const Topic=require('../Model/topicmodel');
const router=express.Router();

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
AWS.config.update({
        accessKeyId: "AKIAID3664MFDJA6M6WQ",
        secretAccessKey:"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",
        region:"ap-south-1"
    });
  var s3 = new AWS.S3();

  var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'quizuser',
        key: function (req, file, cb) {
            console.log(file);
            cb(null, file.originalname); //use Date.now() for unique file keys
        }
    }),
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

// loginsocial api
// post  request  to login  register new user
    //use by upload form

router.post('/register',upload.single('pic'),function(req,res,next){
  //console.log(req.file.originalname);
  //  res.send({"data":req.body});
 console.log(req.body);
   //console.log(req.files);
  var data=req.body;
  var s_type=data.s_type;
  var fcm_id=data.fcm_id;
    //social type are gmail, email , fb
    req.body.coin=10;
    req.body.d_id=req.body.d_id;
    req.body.app_ver=req.body.app_ver;
    req.body.show_ads="y";
    req.body.status="a";
    if ((s_type=="f") || (s_type=="g")) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      if ((data.s_id) && (data.s_type)) {
        User.findOne({s_id:req.body.s_id}).then(function(userdata){
          if(userdata)
          {
              var user_id=userdata.user_id;
                  User.updateOne({user_id:user_id},{"fcm_id": fcm_id},
               function(err, result){

              });
                res.send({"status":true,"code":200,"message":"Login Success","data":userdata,"show_ads":userdata.show_ads,"coin":userdata.coin});

          }
          else {
            //  new social user
            // add 10 w_coin
            extrafunction.generateRefferalcode(data.name, function(r_code){
            //  console.log(r_code);
                req.body.r_code=r_code;
                req.body.pic=req.body.social_pic;
                var tdata= User.findOne().sort({user_id:-1}).select({_id:1,user_id:1}).then(function(tdata){
                  if (tdata) {
                   var countuser=tdata.user_id+1;
                 }else {
                   var countuser=1;
                 }

                   if (countuser=='') {
                       var countuser=1;
                   }
                    req.body.user_id=countuser;
                   req.body._id=countuser;

                  User.create(req.body).then(function(newuser){
                      // when user registration done
                      // create user refferal code
                      res.send({"status":true,"code":200,"message":"New User Register","data":newuser});

                  }).catch(next);
                 });

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
                var user_id=userdata.user_id;
                    User.updateOne({user_id:user_id},{"fcm_id": fcm_id},
                 function(err, result){

                });
                  res.send({"status":true,"code":200,"message":"Login Success","data":userdata,"show_ads":userdata.show_ads});
              }
              else
              {
                // new user

                extrafunction.generateRefferalcode(data.name, function(r_code){
                //  console.log(r_code);
                   req.body.r_code=r_code;
                    //    req.body.data.pic="https://s3.ap-south-1.amazonaws.com/profiletrackerweb/"+req.file.originalname;
                    if(req.file)
                    {
                      req.body.pic='https://s3.ap-south-1.amazonaws.com/quizuser/'+req.file.originalname;
                    }else {
                      req.body.pic='';
                    }
                    var tdata= User.findOne().sort({user_id:-1}).select({_id:1,user_id:1}).then(function(tdata){
                      if (tdata) {
                       var countuser=tdata.user_id+1;
                     }else {
                       var countuser=1;
                     }

                       if (countuser=='') {
                           var countuser=1;
                       }
                       req.body._id=countuser;
                       req.body.user_id=countuser;

                      User.create(req.body).then(function(newuser){
                          // when user registration done
                          // create user refferal code
                          res.send({"status":true,"code":200,"message":"New User Register","data":newuser});

                      }).catch(next);
                     });

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
    var data=req.body;
   console.log(req.body);
    if(data.user_id)
    {
      User.findOne({user_id:data.user_id}).then(function(userdata){
        console.log(userdata);
              if (userdata) {
                if(req.file)
                {
                    userdata.pic='https://s3.ap-south-1.amazonaws.com/quizuser/'+req.file.originalname;
                }
                if(data.gender)
                {
                  userdata.gender=data.gender;
                }
                if(data.name)
                {
                  userdata.name=data.name;
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
                     {user_id:data.user_id},
                      userdata,
                       function(err, result){
                         //  console.log(result);
                         if (err) {
                             res.send({"status":false,"code":404,"message":"Something Went Wrong"});
                         }
                        else {
                            User.findOne({user_id:data.user_id}).then(function(userdata){

                            res.send({"status":true,"code":200,"message":"User Data updated","data":userdata});
                          });
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
var app_ver=req.body.data.app_ver;
  // show all feature game & topic with user coin
    if (req.body.data.user_id) {
      var is_force="n";
      var live_ver=1;
      User.findOne({user_id:req.body.data.user_id}).select({_id:-1,coin:-1,app_ver:-1}).then(function(userdata){
          if(is_force=="y" && live_ver>app_ver)
          {
              res.send({"status":true,"code":201,"message":"New Version is out"});
          }
          else if(live_ver>app_ver) {
              var code=202;
              var message="Dear User,We have added few cool features . To experience them, we request you to kindly update your app";
          } else {
              var code=200;
              var message="Data Found";
          }
      //  console.log(userdata);
      // topic data
       var mart=[{"gems_key":"25_coin","text":"25 Coin","sub_text":"A Small Pack","prize":"1 $"},
              {"gems_key":"50_coin","text":"50 Coin","sub_text":"A Pack to Play","prize":"2 $"}];
        Topic.find({is_trendin:'y'}).select({_id:-1,t_name:-1,img:-1}).limit(10).sort( { _id: -1 } ).then(function(topicdata){
          //console.log(topicdata);
          // current utc time
            var current_utc=Math.floor(new Date()/ 1000);
            Game. aggregate([{
      $lookup: {
         from: "users",
         localField: "creator_id",    // field in the orders collection
         foreignField: "user_id",  // field in the items collection
         as: "user"
      }
   },

   { $match: {time_utc: {$gte: current_utc}} }, { $project: {game_code:1,g_status:1,g_name:1,g_fee:1,time:1,time_utc:1,g_type:1,g_code:1,
        g_prize:1,topics:{_id:1,t_name:-1,img:1},player:{user_id:1},user:{name:1,pic:1}} }]).sort({time_utc:1}).then(function(gamedata){
      //  console.log(gamedata);
       if (gamedata) {
           res.send({"status":true,"code":code,"message":message,"topic":topicdata,"game":gamedata,"coin":userdata.coin,"mart":mart});

       }else {
           res.send({"status":false,"code":404,"message":"No Public game yet try other"});
       }
     });


        });
      });


    }else {
        res.send({"status":false,"code":404,"message":"Required Parameter missing"});
    }
});
router.post('/addcoin',function(req,res,next){
  var user_id=req.body.data.user_id;
  if (user_id) {
    User.findOne({user_id:req.body.data.user_id}).select({_id:-1,coin:-1}).then(function(userdata){
      console.log(userdata);
       if (userdata) {
              var coin=req.body.data.coin;
               if(coin>99)
               {
                 var coin=99;
               }
               user_current_coin=userdata.coin;
               new_coin=user_current_coin+coin;
               User.updateOne({user_id:req.body.data.user_id},{"coin": new_coin},

                 function(err, result){
                   if (err) {
                       res.send({"status":false,"code":404,"message":"Something Went Wrong"});
                   }
                   if (result) {
                      res.send({"status":true,"code":200,"message":"Coin Updated","coin":new_coin});
                   }else {
                        res.send({"status":false,"code":404,"message":"Something Went Wrong"});
                   }
                  });

       }
       else {
           res.send({"status":false,"code":404,"message":"Something Went Wrong"});
       }
    });
  }
  else {
      res.send({"status":false,"code":404,"message":"Required Parameter missing"});
  }
});
router.post('/deductcoin',function(req,res,next){
  var user_id=req.body.data.user_id;
  if (user_id) {
    User.findOne({user_id:req.body.data.user_id}).select({_id:-1,coin:-1}).then(function(userdata){
      console.log(userdata);
       if (userdata) {
              var coin=req.body.data.coin;

               user_current_coin=userdata.coin;
               if(user_current_coin>=coin)
               {
                 new_coin=user_current_coin-coin;
                 User.updateOne({user_id:req.body.data.user_id},{"coin": new_coin},

                   function(err, result){
                     if (err) {
                         res.send({"status":false,"code":404,"message":"Something Went Wrong"});
                     }
                     if (result) {
                        res.send({"status":true,"code":200,"message":"Coin Updated","coin":new_coin});
                     }else {
                          res.send({"status":false,"code":404,"message":"Something Went Wrong"});
                     }
                    });
               }
               else {
                     res.send({"status":false,"code":404,"message":"Dont have sufficent coin to deduct"});
               }


       }
       else {
           res.send({"status":false,"code":404,"message":"Something Went Wrong"});
       }
    });
  }
  else {
      res.send({"status":false,"code":404,"message":"Required Parameter missing"});
  }
});
router.get('/moreapp',function(req,res,next){
  var str= [

   {
            "app_id": 5,
            "app_name": "Whatapp Story Saver",
            "app_desc": "Loved a friend's WhatsApp’s status? Well, You are at Right App\nCurrently on Whatsapp’s you can only view your friend’s status (image or video), but if you want to save it for your use there is no option. Don’t worry this app will solve your problem.\nWith Whatsapp's new status feature, all status automatically disappear after 24 hours. So with our app you can save your favorite status and can access them anytime.",
            "icon": "https://firebasestorage.googleapis.com/v0/b/profiletracker-ef459.appspot.com/o/img%2Fmoreapp%2Fwhatstory.png?alt=media&token=260baa2f-05f6-4ee0-968f-cd4c9e22cf05",
            "url": "https://play.google.com/store/apps/details?id=com.itamazon.whatsstoriessaver"
        },

    {
        "app_id": 2,
        "app_name": "AV MP-3 Player",
        "app_desc": "AV MP-3 Player is one of the best app for music and audio player for Android By using AV MP-3 Player, you can listen to all audio file types. Play your favorite music mp3 and others files!",
        "icon": "https://lh3.googleusercontent.com/Cdcb8wlYsdTlWDPGOvGi1L5I26qojdOSJeh_9dq5mCraBZ__XprUFwMcGlAwiaIVrM8a=s180",
        "url": "http://onelink.to/tyu4c7"
    },
    {
        "app_id": 3,
        "app_name": "Whats Tracker",
        "app_desc": "A perfect useful platform where you can track a user who visits your WhatsApp profile. You can also track your WhatsApp contact's location on map. Now no more hidden visitors you can know details about all the visitors and their location too.",
        "icon": "https://firebasestorage.googleapis.com/v0/b/profiletracker-ef459.appspot.com/o/img%2Fmoreapp%2Fwhatstrack.png?alt=media&token=fd7247a9-4177-4383-bb22-89dcbdcfbd3c",
        "url": "https://play.google.com/store/apps/details?id=com.whatstracker.app"
    },
        {
            "app_id": 4,
            "app_name": "WT chat",
            "app_desc": "Join the perfect Social chatting app! Chat with new people.Chat with people around you. WT Chat is the best social and chatting app to meet new people around you. Simply like or pass on the other people. WT Chat helps you find new people nearby who share your interests and want to chat now! It’s fun, friendly, and free!Main feature of WT Chat app is that you can also check your profile visitor who check your profile in WT Chat app.",
            "icon": "https://firebasestorage.googleapis.com/v0/b/profiletracker-ef459.appspot.com/o/img%2Fmoreapp%2Fwtchat.png?alt=media&token=166cf058-06e6-46c6-9a56-a0ddce19f5f6",
            "url": "http://onelink.to/7tc8mn"
        },


        {
            "app_id": 6,
            "app_name": "Postrunner for Instagram",
            "app_desc": "1. Get Readymade Post with Image, Captions and Hashtags.\r\n2. Automatically get hashtags and captions of your photo \r\n3. Get millions of Images to post from.",
            "icon": "https://firebasestorage.googleapis.com/v0/b/profiletracker-ef459.appspot.com/o/img%2Fmoreapp%2FPostrunner.jpg?alt=media&token=2f4e1831-b551-4099-922d-4919652ee3a6",
            "url": "http://onelink.to/4k72hz"
        }
    ];
    res.send({"code":200,"status":true,"data":str,"message":"Data listed Successfully"});
});
module.exports=router;

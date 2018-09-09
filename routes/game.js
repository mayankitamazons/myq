var express = require('express'),
 bodyParser = require('body-parser');
var multer = require('multer');
const request=require('request');
var extrafunction = require('../function.js');
//const upload=multer({dest:"uploads/"})
// to save data
const User=require('../Model/usermodel');
const Game=require('../Model/gamemodel');
const Topic=require('../Model/topicmodel');
const QuestionModel=require('../Model/questionmodel');
const router=express.Router();
var AWS = require('aws-sdk'),
  multer = require('multer');
 multerS3 = require('multer-s3');
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

router.post('/creategame',function(req,res,next){
//  console.log(req.body.data);

  var data=req.body.data;
  var cat_id=data.cat_id;

   //console.log(catArray);
   var datetime=data.g_date+data.g_time;
   var g_utc=data.g_utc;
    var g_name=data.g_name;
    var user_id=data.user_id;
    // game type p stand for paid , f for free
    var g_type=data.g_type;
    var g_fee=data.g_fee;
  var cat_count=Object.keys(data.cat_id).length;
   if(g_utc && g_name && user_id)
   {
     if ((cat_count)>=3) {
        var current_utc=Math.floor(new Date()/ 1000);
          // console.log(current_utc);
         if(g_utc>current_utc)
         {
            // if payed game then check user balance
                User.findOne({user_id:req.body.data.user_id}).select({user_id:-1,_id:-1,coin:-1,name:-1}).then(function(userdata){
                     if(userdata)
                     {
                         var user_name=userdata.name;
                         // game refferal code
                        var game_code = user_name.substring(0, 3)+Math.floor(Math.random()*9000);
                        // g_type will be free or paid
                        if(g_type=="p")
                        {
                            user_coin=userdata.coin;
                            if(g_fee>user_coin)
                            {
                              // less coin alert
                                res.send({"status":false,"code":101,"message":"Dont have sufficent Coin Earn & Buy it"});0
                                return false;
                            }
                          }
                          var gdata= Game.findOne().sort({_id:-1}).select({_id:1}).then(function(gdata){
                            if (gdata) {
                               var countgame=gdata._id+1;
                             }else {
                               var countgame=1;
                             }

                               if (countgame=='') {
                                   var countgame=1;
                               }
                              // user have sufficent coin go ahead  and create game
                              if(g_type=="p")
                              {
                                // game prize is 70% of game value
                                var g_prize=g_fee *(90/100);
                                var g_prize=Math.round(g_prize*2);
                              }
                              else {
                                  var g_prize=0;
                              }

                            var newgame={
                                         _id:countgame,
                                         g_name:g_name,
                                         g_fee:g_fee,
                                         g_prize:g_prize,
                                         g_status:req.body.data.g_status,
                                         creator_id:req.body.data.user_id,
                                         time:data.g_date+" "+data.g_time,
                                         time_utc:g_utc,
                                         g_type:req.body.data.g_type,
                                         game_code:game_code,
                                         topics:data.cat_id
                                     };
                                     Game.create(newgame).then(function(newgame){
                                       if(g_type=="p")
                                       {
                                       // deduct user account balance
                                         var new_coin=user_coin-g_fee;
                                         User.updateOne({_id:req.body.data.user_id},{"coin": new_coin},

                                           function(err, result){ });
                                         }
                                      res.send({"status":true,"code":200,"message":"New Game Created Successfully","data":newgame,"game_code":game_code,"coin":new_coin});
                                 }).catch(next);
                               });
                              }else {
                           res.send({"status":false,"code":404,"message":"user Not found"});
                     }

                   });




         }
         else {
             res.send({"status":false,"code":404,"message":"Game Creation for past date is not possible"});
         }
     }
     else {
            res.send({"status":false,"code":404,"message":"Select Atleast 3 Topic"});
     }
   }
   else {
       res.send({"status":false,"code":404,"message":"Required Parameter missing"});
   }


});

router.post('/gameimage',upload.single('pic'),function(req,res,next){
  if(req.body.data.user_id && req.body.data.game_id)
  {
    var gdata= Game.findOne({_id:req.body.data.game_id}).then(function(gdata){
      if(req.file)
      {
         game_pic='https://s3.ap-south-1.amazonaws.com/quizking/'+req.file.originalname;
         Game.updateOne({_id:req.body.data.game_id},{"game_banner": game_pic},
            function(err, result){
                if (result) {
                    gdata.game_banner=game_pic;
                     res.send({"status":true,"code":200,"message":"Game Banner Updated","data":gdata});
                }else {
                     res.send({"status":false,"code":404,"message":"Image upload failed"});
                }
           });
       }
    });
  }
  else {
    res.send({"status":false,"code":404,"message":"Required Parameter missing"});
  }
});
router.get('/getalltopic',function(req,res,next){
  Topic.find({}).select({_id:-1,t_name:-1,img:-1}).sort({t_name:1}).then(function(topicdata){
    if (topicdata) {
         res.send({"status":true,"code":200,"message":"topic found",data:topicdata});
    }
    else {

        res.send({"status":false,"code":404,"message":"No Data for topic"});
    }
  });
});
router.post('/topicdetail',function(req,res,next){
   var topic_id=req.body.data.topic_id;
 //console.log(req.body);
  var user_id=parseInt(req.body.data.user_id);
  if (user_id && topic_id) {
    Topic.findOne({"_id":topic_id}).then(function(topicdata){
      console.log(topicdata);
       if (topicdata) {
               var current_utc=Math.floor(new Date()/ 1000);

      //console.log(current_utc);
       Game. aggregate([{
        $lookup: {
           from: "users",
           localField: "creator_id",    // field in the orders collection
           foreignField: "user_id",  // field in the items collection
           as: "user"
        }
     },

     { $match: {"topics._id":topic_id,time_utc: {$gte: current_utc},creator_id:{$ne:user_id},"player.user_id":{$ne:user_id}} }, { $project: {game_code:1,g_status:1,g_name:1,g_fee:1,time:1,time_utc:1,g_type:1,g_code:1,
          g_prize:1,topics:{_id:1,t_name:-1,img:1},player:{user_id:1},user:{name:1,pic:1}} }]).sort({time_utc:1}).then(function(gamedata){
                if (gamedata) {

                }
                else {
                  var gamedata=[];
                }
            var data={
              topic_id:topicdata._id,
              topic_name:topicdata.t_name,
              img:topicdata.img,
              game:gamedata,
              feature_game:[]
            }
               res.send({"status":true,"code":200,"message":"Data found",data:data});

              });
       }else {
           res.send({"status":false,"code":404,"message":"Invalid Topic id"});
       }
     });
  }
  else {
         res.send({"status":false,"code":404,"message":"Required Parameter missing"});
  }

});
// game detail api
router.post('/gamedetail',function(req,res,next){
  var game_id=parseInt(req.body.data.game_id);
  if (game_id) {
  	var current_utc=Math.floor(new Date()/ 1000);
    //console.log(current_utc);
     Game. aggregate([{
      $lookup: {
         from: "users",
         localField: "creator_id",    // field in the orders collection
         foreignField: "user_id",  // field in the items collection
         as: "user"
      },

   },

   { $match: {_id:game_id} }, { $project: {game_code:1,g_status:1,g_name:1,g_fee:1,time:1,time_utc:1,g_type:1,g_code:1,
        g_prize:1,question:1,topics:{_id:1,t_name:-1,img:1},player:{user_id:-1,name:-1,pic:-1},user:{name:1,pic:1}} }]).limit(1).then(function(gamedata){
        //  console.log(gamedata);
       if (gamedata) {


                var question_list=gamedata[0].question;
                // console.log(question_list);
                  var questiondata=[];
                if(question_list) {

                     var q_array=[];
                     question_list.forEach(function(qes) {
                        q_array.push(qes._id);
                     });
                      // console.log(q_array);

                     QuestionModel.find({_id:{$in:q_array}}).then(function(questiondata){

                        //  gamedata[0].question=questiondata;
                        var record=gamedata[0];

                        record.question=questiondata;
                         res.send({"status":true,"code":200,"message":"Game detail","data":record});

                     });
                }
                else {
                    gamedata[0].question=[];
                }





       }else {
            res.send({"status":false,"code":404,"message":"No Game Detail found"});
       }
     });

  }
  else {
    res.send({"status":false,"code":404,"message":"Required Paramter Missing"});
  }
});
router.post('/joingame',function(req,res,next){
  var f_id="f0T11POKM3g:APA91bFbXx5-zNX4Ij-iBnuQkHj14XT1kQnx-IrREt96uRFQVVEdOm3mJFz4PqZlvm-oyDLPW9efA8qhYfSmQfqMp1Ly-8ux6G8j98_cU6HCSJ_KtLf2UpBXJ-GoK3xCek8P2h6k4XwNr2AcWZu1pVS9kZMlvHVlww";
  p_title="Hey join your game";
  var playermsg={
      title:p_title,
      body:''

    };
  extrafunction.sendpush(playermsg,f_id, function(pushresult){
       res.send({"status":false,"code":404,"message":"Required Paramter Missing"});
     });
});
// invitation status of game
router.post('/joingame2',function(req,res,next){
  var data=req.body.data;
  var game_id=parseInt(req.body.data.game_id);
    var user_id=parseInt(req.body.data.user_id);
  if(game_id && user_id)
  {
    Game. aggregate([{
    $lookup: {
       from: "users",
       localField: "creator_id",    // field in the orders collection
       foreignField: "user_id",  // field in the items collection
       as: "user"
    },

 },
 { $match: {_id:game_id} }, { $project: {_id:-1,g_type:-1,g_fee:-1,g_prize:-1,topics:{_id:1,t_name:-1,img:1},player:{user_id:-1,name:-1,pic:-1},user:{name:1,pic:1,fcm_id:1}} }]).limit(1).then(function(gamedata){
          var  gamedata=gamedata[0];
            if (gamedata) {

                var creator_fcm_id=gamedata.user[0].fcm_id;

                  User.findOne({user_id:data.user_id}).select({_id:-1,coin:-1,name:-1,pic:-1}).then(function(userdata){
                      if (userdata) {
                              var user_name=userdata.name;
                                var pic=userdata.pic;
                                var user_coin=userdata.coin;
                                 var g_type=gamedata.g_type;
                                 var g_fee=gamedata.g_fee;
                                 Game.findOne({_id:game_id,"player.user_id":user_id}).select({_id:-1,g_type:-1,g_fee:-1,g_prize:-1,player:-1}).then(function(userplay){
                                      if (userplay) {
                                          res.send({"status":false,"code":404,"message":"User Already Join that game"});
                                      }
                                      else {
                                          if (g_fee>0) {
                                            // payed game
                                            if(user_coin>=g_fee)
                                            {
                                              var player_data=gamedata.player;
                                              var count_player=player_data.length;
                                               console.log(count_player);
                                             if(count_player==0)
                                             {
                                               // game prize is 70% of game value
                                               var winning_prize=g_fee *(90/100);
                                               var winning_prize=Math.round(winning_prize*2);
                                             }
                                             else {
                                               var n_count=count_player+2;
                                               win_1=n_count*g_fee;
                                               var winning_prize=Math.round((win_1/100)*90);
                                                }
                                                new_coin=user_coin-g_fee;
                                                User.updateOne({user_id:user_id},{"coin": new_coin},

                                                  function(err, resultpayed){
                                                    if (err) {
                                                      res.send({"status":false,"code":200,"message":"Failed to deduct coin,try again "});
                                                    //  return false;
                                                    }
                                                    if (resultpayed) {
                                                      var user_data={
                                                     user_id:data.user_id,
                                                     name:user_name,
                                                     pic:pic
                                                   };

                                                         Game.updateOne(
                                                              {_id:game_id},
                                                                { "$push": { "player": user_data },g_prize:winning_prize},
                                                                function(err, result){
                                                                  //  console.log(result);
                                                                  if (err) {
                                                                    res.send({"status":false,"code":404,"message":"Something Went Wrong"});
                                                                  }
                                                                  else
                                                                  {
                                                                     Game.findOne({_id:game_id}).then(function(gamedata){

                                                                       if (creator_fcm_id) {
                                                                         p_title="Hey "+user_name+" join your game";
                                                                         var playermsg={
                                                                             title:p_title,
                                                                             body:''

                                                                           };
                                                                         extrafunction.sendpush(playermsg,creator_fcm_id, function(pushresult){

                                                                            });
                                                                       }

                                                                      res.send({"status":true,"code":200,"message":"Game Iniviation  Accepted","data":gamedata,"coin":user_coin});
                                                                     });
                                                                  }

                                                                }
                                                            )
                                                    }else {
                                                      res.send({"status":false,"code":200,"message":"Failed to deduct coin,try again "});
                                                    //  return false;
                                                    }
                                                   });


                                            }
                                            else {
                                               res.send({"status":false,"code":207,"message":"Dont have sufficent coin to play "});
                                            }
                                          }
                                          else {
                                            // free game
                                            var user_data={
                                 user_id:data.user_id,
                                 name:user_name,
                                 pic:pic
                               };

                                     Game.updateOne(
                                          {_id:game_id},
                                            { "$push": { "player": user_data }},
                                            function(err, result){
                                              //  console.log(result);
                                              if (err) {
                                                res.send({"status":false,"code":404,"message":"Something Went Wrong"});
                                              }
                                              else
                                              {
                                                 Game.findOne({_id:game_id}).then(function(gamedata){
                                                   if (creator_fcm_id) {
                                                     p_title="Hey "+user_name+" join your game";
                                                     var playermsg={
                                                         title:p_title,
                                                         body:''

                                                       };
                                                     extrafunction.sendpush(playermsg,creator_fcm_id, function(pushresult){

                                                        });
                                                   }
                                                  res.send({"status":true,"code":200,"message":"Game Iniviation  Accepted","data":gamedata,"coin":user_coin});
                                                 });
                                              }

                                            }
                                        )
                                          }
                                      }
                                 });

                      }
                      else {
                          res.send({"status":false,"code":404,"message":"User not found"});
                      }
                  });
            }else {

               res.send({"status":false,"code":404,"message":"Game not found"});
            }
        });
  }
});

// 90 sec before start of game send notification to player of game & assing question to game
router.post('/gamestartbefore',function(req,res,next){
  // select all games whose time lies b/w selected time slot
  var add_minutes =  function (dt, minutes) {
    return new Date(dt.getTime() + minutes*60000);
  }
  var current_utc=Math.floor(new Date()/ 1000);
  var timeafter10=add_minutes(new Date(),10000000);
  var utc10=Math.floor(timeafter10/1000);
  Game.find({time_utc: {$gte: current_utc, $lt: utc10},send_push:"n"} ).sort({time_utc:1}).populate('pl').then(function(gamedata){
    //  console.log(gamedata);
      if (gamedata) {
            var game_count=gamedata.length;
            if (game_count>0) {
                      gamedata.forEach(function(singlegame) {
                        var game_id=singlegame._id;
                         var topic_list=singlegame.topics;
                         // get all player ids
                         var player_array = [];
                         var player_data=singlegame.player;
                         var player_count=player_data.length;
                         var creator_id=singlegame.creator_id;
                         User.findOne({user_id:creator_id}).then(function(userdata){
                           if (userdata)
                           {
                              var topic_list=singlegame.topics;
                               // assing question to game
                               extrafunction.questionassign(topic_list,game_id, function(qresult){

                                  });
                                //console.log(userdata);
                                if(userdata.fcm_id=='')
                                {
                                    var creator_fcm_id=userdata.fcm_id;
                                }
                                else {
                                      var creator_fcm_id=userdata.fcm_id;
                                }
                                if(player_count<=0)
                                {
                                  var msg={
                                           title: 'Invite Friends to play game',
                                           body: 'You know if you invite more friend winning value will be more',
                                           game_id:game_id,
                                           type:"opengame"
                                         };

                                       // send invitation to game admin to add more people
                                }
                              else {
                                      // send invitation to game admin to add more people
                                      // send alert to game player too for be ready to play
                                      //console.log(player_data);
                                      var bodymsg=singlegame.game_name+" wil be start soon";
                                      var playermsg={
                                          title: 'Lets ready to play',
                                          body:bodymsg,
                                          game_id:game_id,
                                          type:"opengame"

                                        };

                                      player_data.forEach(function(singleplayer) {

                                              player_array.push(singleplayer.user_id);
                                      });
                                      User.find({user_id:{$in:player_array},fcm_id:{"$nin":[ null,""]}}).select({user_id:-1,fcm_id:-1}).then(function(userdata){
                                      var player_fcm_id=userdata.fcm_id;

                                        extrafunction.sendpush(playermsg,player_fcm_id, function(pushresult){
                                             console.log(pushresult);
                                           });
                                      });

                                     var msg={
                                         title: 'Add more play to game via inviting',
                                         body: 'You know if you invite more friend winning value will be more',
                                         game_id:game_id,
                                         type:"opengame"
                                       };




                                    }
                                    extrafunction.sendpush(msg,creator_fcm_id, function(pushresult1){
                                      console.log(pushresult1);
                                    });
                              }

                         });
                         Game.updateOne({_id:game_id},{"send_push":"y"},
                        function(err, result){
                            if (result) {

                                 res.send({"status":true,"code":200,"message":"Game Push notifcation send"});
                            }else {
                                 res.send({"status":false,"code":404,"message":"Failed to update push status"});
                            }
                       });
                      });
            }
            else {
                 res.send({"status":false,"code":404,"message":"No  Game found"});
            }
      }
      else {
          res.send({"status":false,"code":404,"message":"Game not found"});
      }
  });
});
// send push notificatio before 10 sec start of game
router.post('/gamestartbefore10sec',function(req,res,next){
  // select all games whose time lies b/w selected time slot
  var add_minutes =  function (dt, minutes) {
    return new Date(dt.getTime() + minutes*60000);
  }
  var current_utc=Math.floor(new Date()/ 1000);
  var timeafter10=add_minutes(new Date(),10000000);
  var utc10=Math.floor(timeafter10/1000);
  Game.find({time_utc: {$gte: current_utc, $lt: utc10},send_2_push:"n"} ).sort({time_utc:1}).then(function(gamedata){
     console.log(gamedata);
      if (gamedata) {
            var game_count=gamedata.length;
            if (game_count>0) {
                      gamedata.forEach(function(singlegame) {
                        var game_id=singlegame._id;
                        var game_time=singlegame.time;
                        console.log(game_time);
                        extrafunction.formatAMPM(game_time, function(timeresult){
                          console.log(timeresult);
                        });
                        return false;
                         var topic_list=singlegame.topics;
                         // get all player ids
                         var player_array = [];
                         var player_data=singlegame.player;
                         var player_count=player_data.length;
                         var creator_id=singlegame.creator_id;
                         User.findOne({user_id:creator_id}).then(function(userdata){
                           if (userdata)
                           {

                                //console.log(userdata);
                                if(userdata.fcm_id=='')
                                {
                                    var creator_fcm_id=userdata.fcm_id;
                                }
                                else {
                                      var creator_fcm_id=userdata.fcm_id;
                                }
                                if(player_count<=0)
                                {
                                  var msg={
                                           title: 'Dont Worry, Still you can add more player',
                                           body: 'Try hard to add more player',
                                           game_id:game_id,
                                           type:"opengame"
                                         };

                                       // send invitation to game admin to add more people
                                }
                              else {
                                      // send invitation to game admin to add more people
                                      // send alert to game player too for be ready to play
                                      //console.log(player_data);

                                      var bodymsg=singlegame.game_name+" wil be start at";
                                      var playermsg={
                                          title: 'Lets ready to play',
                                          body:bodymsg,
                                          game_id:game_id,
                                          type:"opengame"

                                        };

                                      player_data.forEach(function(singleplayer) {

                                              player_array.push(singleplayer.user_id);
                                      });
                                      User.find({user_id:{$in:player_array},fcm_id:{"$nin":[ null,""]}}).select({user_id:-1,fcm_id:-1}).then(function(userdata){
                                      var player_fcm_id=userdata.fcm_id;

                                        extrafunction.sendpush(playermsg,player_fcm_id, function(pushresult){
                                             console.log(pushresult);
                                           });
                                      });

                                     var msg={
                                         title: 'Add more play to game via inviting',
                                         body: 'You know if you invite more friend winning value will be more',
                                         game_id:game_id,
                                         type:"opengame"
                                       };




                                    }
                                    extrafunction.sendpush(msg,creator_fcm_id, function(pushresult1){
                                      console.log(pushresult1);
                                    });
                              }

                         });
                         Game.updateOne({_id:game_id},{"send_push":"y"},
                        function(err, result){
                            if (result) {

                                 res.send({"status":true,"code":200,"message":"Game Push notifcation send"});
                            }else {
                                 res.send({"status":false,"code":404,"message":"Failed to update push status"});
                            }
                       });
                      });
            }
            else {
                 res.send({"status":false,"code":404,"message":"No  Game found"});
            }
      }
      else {
          res.send({"status":false,"code":404,"message":"Game not found"});
      }
  });
});
// topic question
router.post('/topicquestion',function(req,res,next){
  const QuestionModel=require('../Model/questionmodel');

  var t_id=req.body.data.t_id;
  if(t_id) {
    QuestionModel.aggregate([
     { $match: {"t_data._id":t_id} },
    { $project: {_id:1,question:1,a:1,b:1,c:1,d:1,ans:1,q_image:1} }
  ]).sample(10).limit(10).then(function(questiondata){
            if (questiondata) {
                res.send({"status":true,"code":200,"message":"Question List found","data":questiondata,"time":10});
            }
            else {

            }
        });
  }
  else {

      res.send({"status":false,"code":404,"message":"Topic id missing"});
  }


});
 router.post('/recordapi',function(req,res,next){
     res.send({"status":false,"code":404,"message":"Topic id missing"});
 });
// my create & assiged game
router.post('/mygame',function(req,res,next){
  var user_id=req.body.data.user_id;
  var type=req.body.data.type;
  if (user_id) {
         if(type=="created")
         {
           Game.find({creator_id:user_id} ).sort({g_prize:-1}).then(function(gamedata){
             if (gamedata.length>0) {
                 res.send({"status":true,"code":200,"message":"Game Found","data":gamedata});
             }else {
                 res.send({"status":false,"code":404,"message":"No Game Created yet , Create it"});
             }
           });
         } else if(type=="invite")
         {
           // game played by me
           Game.find({"player.user_id":user_id} ).sort({time_utc:-1}).then(function(gamedata){
             if (gamedata.length>0) {
                 res.send({"status":true,"code":200,"message":"Game Found","data":gamedata});
             }else {
                 res.send({"status":false,"code":404,"message":"Take part on games"});
             }
           });
         }
         else {
             res.send({"status":false,"code":404,"message":"Invalid Type Selection"});
         }

  }
  else {
      res.send({"status":false,"code":404,"message":"Required Paramter missing"});
  }
});
// public game feed
// public game feed
router.post('/feedgame',function(req,res,next){
//  console.log(req.body);
    var user_id=parseInt(req.body.user_id);
    if(user_id)
    {
      var current_utc=Math.floor(new Date()/ 1000);
      //console.log(current_utc);
       Game. aggregate([{
        $lookup: {
           from: "users",
           localField: "creator_id",    // field in the orders collection
           foreignField: "user_id",  // field in the items collection
           as: "user"
        }
     },

      { $match: {g_status:"p",time_utc: {$gte: current_utc},creator_id:{$ne:user_id},"player.user_id":{$ne:user_id}}},{ $project: {game_code:1,g_status:1,g_name:1,g_fee:1,time:1,time_utc:1,g_type:1,g_code:1,
          g_prize:1,topics:{_id:1,t_name:-1,img:1},player:{user_id:1},user:{name:1,pic:1}} }]).sort({_id:-1}).then(function(gamedata){
          //  console.log(gamedata);
         if (gamedata) {
                if ((gamedata.length)>0) {
                       res.send({"status":true,"code":200,"message":"Game found","data":gamedata});
                }
                else {
                   res.send({"status":false,"code":404,"message":"No Public game yet try other"});
                }

         }else {
             res.send({"status":false,"code":404,"message":"No Public game yet try other"});
         }
       });
    }
    else {
        res.send({"status":false,"code":404,"message":"Required Paramter missing"});
    }




});

module.exports=router;

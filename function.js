const User=require('./Model/usermodel');
const question=require('./Model/questionmodel');
const Game=require('./Model/gamemodel');
  const QuestionModel=require('./Model/questionmodel');
  const GameScore=require('./Model/scoremodel');
 var extrafunction = require('./function.js');
var methods = {};
var result;
methods.generateRefferalcode = function(user_name,callback) {
  var ref_code = (user_name.toUpperCase()).substring(0, 4)+Math.floor(1000 + Math.random() * 9000);
  User.findOne({r_code:ref_code}).then(function(userdata){
     if (userdata) {
       generateRefferalcode(user_name);
     }
     else {
      callback(ref_code);
     }

  });
   //callback(ref_code);
};
// assing question to game
methods.questionassign = function(topic_list,game_id,callback) {
    const QuestionModel=require('./Model/questionmodel');
    t_ids=[];
     topic_list.forEach(function(t_data) {
      //    t_ids[]=t_data._id;
          t_ids.push(t_data._id);
        });

  QuestionModel.aggregate([
       { $match:{'t_data._id':{$in:t_ids}}},
        { $project: {_id:1} }
      ]).sample(10).limit(10).then(function(questiondata){
        console.log(game_id);
           console.log(questiondata);
          // return false;
          if ((questiondata.length)>0) {

            Game.updateOne(
                       {_id:game_id},
                         { "$push": {question:questiondata} },

                         function(err, result){
                           //  console.log(result);
                           if (err) {
                            callback({"status":false});
                           }
                           else
                           {
                                callback({"status":true});
                           }

                         }
                     )
          }
          else {

          }

});
};
// get 12 hr fomrat time
methods.formatAMPM = function(date,callback) {

  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  callback(strTime);
};
// question detail
methods.questiondetail = function(question_ids) {
var question_ids=[1,2,3];
  question.find({_id:{$in:question_ids}}).then(function(questiondata){
    callback(questiondata);

  });   
   //callback(ref_code);
};  
methods.gamedetail = function(game_id,user_id,callback) {
	//console.log(game_id);
	self_stauts=0;
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
			if (gamedata) {
        
              
                var question_list=gamedata[0].question;
                // console.log(question_list);
                  var questiondata=[];
                if(question_list) {     

                     var q_array=[];
                     question_list.forEach(function(qes) {
                        q_array.push(qes._id);
                     });
                      
					if(q_array.length>0)
					{
						QuestionModel.find({_id:{$in:q_array}}).then(function(questiondata,callback){

                        //  gamedata[0].question=questiondata;
                        var record=gamedata[0];
						var player_list=record.player;
					    
						 var length = player_list.length;
						 if(length>0)
						 {
							for(var i = 0; i < length; i++) {
							if(player_list[i].user_id == user_id)
							   self_stauts=1;
							} 
						 }
						 else
						 {
							 var self_stauts=0; 
						 }
						 
						
						record.self_stauts=self_stauts;
                        record.question=questiondata;
                         callback(record);

                     });
					}
					else
					{
						var record=gamedata[0];
						var player_list=record.player;
						 var length = player_list.length;
						 if(length>0)
						 {
							for(var i = 0; i < length; i++) {
							if(player_list[i].user_id == user_id)
							   self_stauts=1;
							} 
						 }
						 else
						 {
							 var self_stauts=0; 
						 }
						 
						
						record.self_stauts=self_stauts;
                        record.question=[];
                         callback(record);
					}
						
                     
                }  
                else {
					 var record=gamedata[0];
						var player_list=record.player;
						 var length = player_list.length;
						 if(length>0)
						 {
							for(var i = 0; i < length; i++) {
							if(player_list[i].user_id == user_id)
							   self_stauts=1;
							} 
						 }
						 else
						 {
							 var self_stauts=0; 
						 }
						 
						
						record.self_stauts=self_stauts;
                        record.question=[];
                         callback(record);
                }
		}
	    else
		{
			callback(false);
		}
		});
};
// check user as player eixt or not     
methods.playercheck = function(player_list,user_id,creator_id,callback) { 
	  var length = player_list.length;
	 
	  if(creator_id==user_id)
	  {
		  var self_stauts=1;
	  }
	  else
	  {
		   var self_stauts=0;
	  }
	  
 
    for(var i = 0; i < length; i++) {
        if(player_list[i].user_id == user_id)
           self_stauts=1;
    }
   
	callback(self_stauts);   
};
// assign winner of game 
methods.winnerassign = function(player_list,scoredata,winning_amount,game_id,callback) {
	 var player_array =[];
	 var s_array=[];
	 var length = player_list.length;
	 console.log(scoredata);
	 if(length>0)
	 {
		  player_list.forEach(function(singleplayer) {
			player_array.push(singleplayer.user_id);
        });
		scoredata.forEach(function(splayer) {
			s_array.push(splayer.user_id);
        });  
		console.log(s_array);   
		User.find({user_id:{$in:player_array}}).select({user_id:-1,fcm_id:-1}).then(function(userdata){
			if(userdata)
			{
				// update winner 
				
				GameScore.updateMany(   
				   {user_id:{$in:s_array},game_id:game_id},
				   { $set: {is_winner:"y",winning_amout:winning_amount} },  
				   
					function(err, result){
                   if (err) {
                     callback(false);
                   }
                   if (result) {
                             Game.updateOne(   
									   {_id:game_id},
									   { $set:{winner_assign:"y"}},      
									   
										function(err, result){
									   if (err) {
											callback(false);
									   }      
									   if (result) {
											// update game status    
											    var winmsg={
														   title: 'You won',
														   body: 'You win '+winning_amount+'coin ,check Now!!'
														  
														 };
														var winmsgdata={
															   title: 'You won',
																body: 'You win '+winning_amount+'coin ,check Now!!',
															   game_id:game_id,
															   type:"openresult"
															 };
													  var resmsg={
														   title: 'Result Declare',
														   body: 'Result for current playing is declare,check Now!!'
														  
														 };
														var resmsgdata={
															   title: 'You won',
																body: 'You win '+winning_amount+'coin ,check Now!!',
															   game_id:game_id,
															   type:"openresult"
															 };
												 userdata.forEach(function(singleuser) {
													 var s_user_id=singleuser.user_id;   
													 var s_fcm_id=singleuser.fcm_id;   
													 if(s_array.includes(s_user_id))
													 { 
														
													//update user wallet 
													    exports.updatecoin(s_user_id,function (updatejoin) {
															exports.sendnoti(winmsg,winmsgdata,s_fcm_id,function (json) {
															
														});
														});
														
														 
														   
													 }      
													 else
													 {      
														exports.sendnoti(resmsg,resmsgdata,s_fcm_id,function (json) {
															
														});
														  
													 }      
												 });
												 callback(true);
											
									   }else {
											callback(false);
										}}
									)					   
                        
						
                   }else {
                       callback(false);
                   }
                  }
				);   
				
			}
			else
			{
				callback(false);
			}
		});
		
	 }
	 else
	 {
		 callback(false);
	 }
	 
	 
};
// send push  notification
methods.sendpush = function(msg,msgdata,register_ids,callback) {
  var admin = require('firebase-admin');

var serviceAccount = require('./config/quiz-king-ce809-bc1c6ad40b49.json');
try {
admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: 'https://quiz-king-ce809.firebaseio.com/'
});
}
catch (err) {
   console.error('Firebase initialization error', err.stack)
}
// This registration token comes from the client FCM SDKs.
var registrationToken = register_ids;
var msgdata = JSON.stringify(msgdata);
var msgd={"title":msg.title,"body":msg.body,data:msgdata};
// See documentation on defining a message payload.
var message = {
  data:msgd,
  android: {
   ttl: 3600 * 1000, // 1 hour in milliseconds
   priority: 'normal',
   notification:msg
 },  
  notification:msg,
  token: registrationToken
};

// Send a message to the device corresponding to the provided
// registration token.
admin.messaging().send(message)
  .then((response) => {
    // Response is a message ID string.
      callback(response);
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
      callback(error);
    console.log('Error sending message:error:',error);
  });


};
exports.updatecoin=function(user_id,callback){
	console.log('coin updated');
};   
exports.sendnoti = function(msg,msgdata,register_ids,callback) {
      var admin = require('firebase-admin');

var serviceAccount = require('./config/quiz-king-ce809-bc1c6ad40b49.json');
try {
admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: 'https://quiz-king-ce809.firebaseio.com/'
});
}
catch (err) {
   console.error('Firebase initialization error', err.stack)
}
// This registration token comes from the client FCM SDKs.
var registrationToken = register_ids;
var msgdata = JSON.stringify(msgdata);
var msgd={"title":msg.title,"body":msg.body,data:msgdata};
// See documentation on defining a message payload.
var message = {
  data:msgd,
  android: {
   ttl: 3600 * 1000, // 1 hour in milliseconds
   priority: 'normal',
   notification:msg
 },  
  notification:msg,
  token: registrationToken
};

// Send a message to the device corresponding to the provided
// registration token.
admin.messaging().send(message)
  .then((response) => {
    // Response is a message ID string.
      callback(response);
    console.log('Successfully sent message:', response);       
  })
  .catch((error) => {
      callback(error);
    console.log('Error sending message:error:',error);
  });

}

module.exports = methods;

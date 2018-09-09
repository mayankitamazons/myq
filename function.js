const User=require('./Model/usermodel');
const question=require('./Model/questionmodel');
const Game=require('./Model/gamemodel');
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
});
// question detail
methods.questiondetail = function(question_ids) {
var question_ids=[1,2,3];
  question.find({_id:{$in:question_ids}}).then(function(questiondata){
    callback(questiondata);

  });
   //callback(ref_code);
};
// send push  notification
methods.sendpush = function(msg,register_ids,callback) {
  var admin = require('firebase-admin');

var serviceAccount = require('./config/quiz-king-ce809-bc1c6ad40b49.json');

admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: 'https://quiz-king-ce809.firebaseio.com/'
});
// This registration token comes from the client FCM SDKs.
var registrationToken = register_ids;

// See documentation on defining a message payload.
var message = {
  data:msg,
  ttl:date('Y-m-d G:i:s'),
  android: {
   ttl: 3600 * 1000, // 1 hour in milliseconds
   priority: 'normal',
   notification: {
     title: '$GOOG up 1.43% on the day',
     body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.',
     icon: 'stock_ticker_update',
     color: '#f45342'
   }
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


module.exports = methods;

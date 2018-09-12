var express = require('express'),
 bodyParser = require('body-parser');
const request=require('request');
var AWS = require('aws-sdk'),
  multer = require('multer');
 multerS3 = require('multer-s3');
const router=express.Router();
const Category=require('../Model/categorymodel');
const Topic=require('../Model/topicmodel');

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
        bucket: 'quizking',
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



router.post('/addcategory',function(req,res,next){
  //console.log(req.body);
  // show all feature game & topic with user coin
  var data=req.body.data;
  if (data) {
       Category.create(req.body.data).then(function(newcategory){
         if (newcategory) {
           res.send({"status":true,"code":200,"message":"Category Save","data":newcategory});
         }
         else {
           res.send({"status":false,"code":400,"message":"Failed to Create"});
         }
       });
  }
});
router.post('/addtopic',upload.single('pic'),function(req,res,next){

  //console.log(req.body);
  // show all feature game & topic with user coin
  var r_body=req.body;
  if (r_body) {
    var datetimestamp = Date.now();
   var d_id=datetimestamp+Math.floor(100 + Math.random() * 900);
         var newtopic={
           _id:d_id,
           t_name:r_body.t_name,
           cat_id:[{cat_id:r_body.cat_id}],
           img:'https://s3.ap-south-1.amazonaws.com/quizking/'+req.file.originalname
         };
       Topic.create(newtopic).then(function(newtopic){
         if (newtopic) {
           res.send({"status":true,"code":200,"message":"Topic Save","data":newtopic});
         }
         else {
           res.send({"status":false,"code":400,"message":"Failed to Create"});
         }
       });
  }
});
module.exports=router;

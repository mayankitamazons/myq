var express = require('express');
   var app = express();
   var bodyParser = require('body-parser');
   var multer = require('multer');
   var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
const QuestionModel=require('../Model/questionmodel');
const Topic=require('../Model/topicmodel');
const router=express.Router();
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
      cb(null, file.originalname); //use Date.now() for unique file keys
      //  cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var upload = multer({ //multer settings
                storage: storage,
                fileFilter : function(req, file, callback) { //file filter
                    if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                        return callback(new Error('Wrong extension type'));
                    }
                    callback(null, true);
                }
            }).single('file');
router.post('/file',function(req,res,next){
  var exceltojson; //Initialization
         upload(req,res,function(err){
             if(err){
                  res.json({error_code:1,err_desc:err});
                  return;
             }
             /** Multer gives us file info in req.file object */
             if(!req.file){
                 res.json({error_code:1,err_desc:"No file passed"});
                 return;
             }
             //start convert process
             /** Check the extension of the incoming file and
              *  use the appropriate module
              */
             if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                 exceltojson = xlsxtojson;
             } else {
                 exceltojson = xlstojson;
             }
             try {
                 exceltojson({
                     input: req.file.path, //the same path where we uploaded our file
                     output: null, //since we don't need output.json
                     lowerCaseHeaders:true
                 }, function(err,result){
                     if(err) {
                         return res.json({error_code:1,err_desc:err, data: null});
                     }
                     var count=0;
                    result.forEach(function(res, index) {
                      var topic_name=res.topic;

                    if (topic_name) {
                          Topic.findOne({t_name:topic_name}).then(function(tdata){
                            console.log(tdata);
                        if(tdata)
                        {
                          var topic_id=tdata._id;
                         var datetimestamp = Date.now();
                        var d_id=datetimestamp+Math.floor(100 + Math.random() * 900);
                            var qdata={
                              _id:d_id,
                            question:res.question,
                            a:res.a,
                            b:res.b,
                            c:res.c,
                            d:res.d,
                            ans:res.answer,
                            t_data:[{t_id:topic_id,t_name:topic_name}],
                          };
                          // insert question
                           QuestionModel.create(qdata).then(function(err,qresult){
                              // console.log("New question insterd");
                             count++;
                           });

                        }
                        else {
                            console.log('else case');
                        //  res.json('no topic data found');
                          // add new topic then go aheas


                               var datetimestamp = Date.now();
                               var d_id=datetimestamp+Math.floor(10 + Math.random() * 99);
                                  var newtopic={
                                    _id:d_id,
                                    t_name:topic_name,
                                    cat_id:[{cat_id:"5b41ac7bd0031c1574d9f6bf"}],
                                    img:'https://s3.ap-south-1.amazonaws.com/quizking/'+topic_name+".png"
                                  };
                                Topic.create(newtopic).then(function(topicresult){

                                //  console.log("New Topic inserted");
                                  if (topicresult) {
                                    var topic_id=topicresult._id;
                                    var qdata={
                                      _id:d_id,
                                      question:res.question,
                                      a:res.a,
                                      b:res.b,
                                      c:res.c,
                                      d:res.d,
                                      ans:res.answer,
                                      t_data:[{t_id:topic_id,t_name:topic_name}],
                                    };
                                    // insert question
                                     QuestionModel.create(qdata).then(function(err,qresult){

                                      console.log("New question inserted");
                                       count++;
                                     });

                                  }

                                });


                        }
                      });

                    }

                      var tdata='';

                    });
                    res.json({error_code:0,err_desc:null, data: result,"question count":count});
                 });
             } catch (e){
                 res.json({error_code:1,err_desc:"Corupted excel file"});
             }
         });
});
module.exports=router;

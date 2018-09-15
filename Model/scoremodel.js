var mongoose=require('mongoose');
var schema=mongoose.Schema;
var ObjectIdSchema = schema.ObjectId;
var ObjectId = mongoose.Types.ObjectId;
var RecordSchema=new schema({
     q_id:{type:String},
     time:{type:Number},
     ans:{type:String},
     right_ans:{type:String},
});
var Scoreschema=new schema({
     _id:    {type:ObjectIdSchema, default: new ObjectId()},
    game_id:{type:Number,required:true},
    user_id:{type:Number,required:true},
	is_winner:{type:String,enum: ['y','n']},
    time:{type:Number,required:true},
    winning_amout:{type:Number},  
    right_ans:{type:Number,required:true},
	record:[RecordSchema],
	submit_time:{ type : Date, default: Date.now }
});
var Score=mongoose.model('score',Scoreschema);
module.exports=Score;

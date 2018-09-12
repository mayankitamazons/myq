var mongoose=require('mongoose');
var schema=mongoose.Schema;
var ObjectIdSchema = schema.ObjectId;
var ObjectId = mongoose.Types.ObjectId;
var TopicSchema=new schema({
    _id:    {type:String,required:true},
    t_name:{type:String},
    t_id:{type:Number,required:true}
});
var QuestionSchema=new schema({
    _id:   {type:String,required:true},
    question:{type:String,required:true},
    a:{type:String,required:true},
    b:{type:String,required:true},
    b:{type:String,required:true},
    c:{type:String,required:true},
    d:{type:String,required:true},
    ans:{type:String,required:true},
    q_image:{type:String},
    t_data:[TopicSchema]
});
var Question=mongoose.model('question',QuestionSchema);
module.exports=Question;

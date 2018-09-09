var mongoose=require('mongoose');
var schema=mongoose.Schema;
var ObjectIdSchema = schema.ObjectId;
var ObjectId = mongoose.Types.ObjectId;
var CategorySchema=new schema({
     cat_id:{
      type:String
    }
});
var Topicschema=new schema({
    _id:   {type:String,required:true},
    t_name:{type:String,required:true},
    img:{type:String},
    status:{
      type: String,
      enum: ['0', '1'],
      default:'1'
    },
    is_trendin:{
      type: String,
      enum: ['y', 'n'],
      default:'n'
    },
      cat_id:[CategorySchema]
});
var Topic=mongoose.model('topic',Topicschema);
module.exports=Topic;

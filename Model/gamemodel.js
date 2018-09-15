var mongoose=require('mongoose');
var schema=mongoose.Schema;
var ObjectIdSchema = schema.ObjectId;
var ObjectId = mongoose.Types.ObjectId;
var TopicSchema=new schema({
     _id:{type:String},
      img:{type:String},
       t_name:{type:String}
});
var PlayerSchema=new schema({
     user_id:{
      type:Number
    },
    join_time : { type : Date, default: Date.now },
    name:{type:String,required: true},
    pic:{type:String,required: true}
});
var QuestionSchema=new schema({
     _id:{
      type:Number
    }
});
var GameSchema=new schema({
  _id:{
    type:Number
  },
    g_name:{type:String,required: true},
    game_code:{type:String,required: true},
    g_prize:{type:Number},
    g_fee:{type:Number},
    // game status will be public & private
    g_status:{type:String,enum: ['p','pr'],default:'p'},
    // g_Type will be free or paid
    g_type:{type:String,enum: ['f','p']},
    is_featured:{type:String,enum: ['y','n']},
   
    game_banner:{type:String},
    creator_id:{type:Number,required:true},
    time:{type:Date},
    time_utc:{type:Number,required:true},
    created : { type : Date, default: Date.now },
    banner:{type:String},
    player:[PlayerSchema],
    topics:[TopicSchema],
    question:[QuestionSchema],
    send_push:{type:String,enum: ['y','n'],default:'n'},
    winner_assign:{type:String,enum: ['y','n'],default:'n'}

});
var Game=mongoose.model('game',GameSchema);
module.exports=Game;

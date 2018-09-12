var mongoose=require('mongoose');
var schema=mongoose.Schema;
var ObjectIdSchema = schema.ObjectId;
var ObjectId = mongoose.Types.ObjectId;
// create user default Schema
var UserSchema=new schema({
   _id:{
    type:Number
  },
  user_id:{
  type:Number,Required:true
},
  name:
  {
    type:String
  },
  email:
  {
    type:String,
    match:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },
  // mobile no that will use to redeem
  mobile:
  {
    type:Number
  },
  pic:
    {
      type:String
    },
  s_id:
  {
    type:String
  },
  // define login type like gmail , fb, mobile
  s_type:{
    type: String,
    enum: ['f', 'g','m']
  },
  token:
  {
    type:String
  },
  fcm_id:
  {
    type:String
  },
  app_ver:
  {
    type:String
  },
  signup_ver:
  {
    type:String
  },
  // define refferal code
  r_code:
  {
    type:String
  },
  // if user is reffered by someone then friend all
  r_via:
  {
    type:Number,
    default:0
  },
  // store user coin
  coin:
  {
    type:Number
  },
  d_id:
  {
    type:String
  },
  // a stand for active , i- inactive , b- user block
  status:{
    type: String,
    enum: ['a', 'i','b']
  },
  show_ads:{
    type: String,
    enum: ['y', 'n'],
    default:'y'
  },
  time : { type : Date, default: Date.now },
  gender:{
    type: String,
    enum: ['f','m']
  },
  dob: { type: Date},
  country: { type: String}
});
var User=mongoose.model('user',UserSchema);
module.exports=User;

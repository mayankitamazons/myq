var mongoose=require('mongoose');
var schema=mongoose.Schema;
var ObjectIdSchema = schema.ObjectId;
var ObjectId = mongoose.Types.ObjectId;
var CategorySchema=new schema({
    _id:    {type:ObjectIdSchema, default: new ObjectId()},
    cat_name:{type:String,required:true},
    created : { type : Date, default: Date.now },
});
var Category=mongoose.model('category',CategorySchema);
module.exports=Category;

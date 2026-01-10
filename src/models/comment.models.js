import mongoose from "mongoose";
import { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const CommentSchema= new mongoose.Schema({
    contentCommented:{
        type:String,
        required:true
    },
    video:{
        type: Schema.Types.ObjectId,
        ref:"Video"
    },
    CommentedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{
    timestamps:true
});
CommentSchema.plugin(mongooseAggregatePaginate)

export const Comment=mongoose.model("Comment",CommentSchema)
import mongoose, { SchemaType } from "mongoose";
import { Schema } from "mongoose";

const likeSchema= new mongoose.Schema({
    LikedBy:{
        type: Schema.Type.ObjectId,
        ref:"User"
    },
    video:{
        type:Schema.Type.ObjectId,
        ref:"Video"
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:"comment"
    }
})

export const Like=mongoose.model("Like",likeSchema)
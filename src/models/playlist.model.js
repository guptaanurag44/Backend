import mongoose,{Schema} from "mongoose";

const playlistmodel=new mongoose.Schema({
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"

    },
    CreatedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    PlaylistName:{
        type:String,
        required:true
    }

},{
    timestamps:true
})
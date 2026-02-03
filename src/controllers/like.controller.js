import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError("invalid video id")
    }
    
    const isliked=await Like.findOne({
        LikedBy:req.user?._id,
        Video:videoId
    })
    if(isliked){
        const removeLike=await Like.findByIdAndDelete(isliked._id)
        return res
        .status(200)
        .json (new ApiResponse(200,removeLike,"liked removed"))
    }
    else{
        const createLike=await Like.create({
            LikedBy:req.user?._id,
            Video:videoId
        })
        return res
        .status(200)
        .json(new ApiResponse(200,createLike,"like added sucessfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //user id of logged in user 
    const userId=req.user?._id
    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError("comment does not exists")
    }
    if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError("please login to like")
    }
    const isliked=await Like.findOne({
        comment:commentId,
        LikedBy:userId
    })
    if(isliked){
        const removeLike=await Like.findByIdAndDelete(isliked._id)
        return res
        .status(200)
        .json( new ApiResponse(200,removeLike,"like removed"))
    }
    else{
        const createLike=await Like.create({
            LikedBy:userId,
            comment:commentId
        })
        return res
        .status(200)
        .json(new ApiResponse(200,createLike,"like added"))
    }

})


const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId=req.user?._id
    if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError("please login to get all liked videos")
    }
    const allLikedVideos=await Like.findOne({
        LikedBy:userId
    })
    return res
    .status(200)
    .json(new ApiResponse(200,allLikedVideos,"success"))
})

export {
    toggleCommentLike,
    toggleVideoLike,
    getLikedVideos
}
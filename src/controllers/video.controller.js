import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asynchandler } from "../utils/asynchandler.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, text, sortBy, sortType, userId } = req.query

    if(userId){
        if(mongoose.Types.ObjectId.isValid(userId)){
            filter.owner= new mongoose.Types.ObjectId(userId)
        }
        else{
            throw new ApiError(404,"invalid user id")
        }
    }

    
    
    filter.isPublished=true
    if(text){
        filter.$or=[  
            {
                title:{
                    $regex:text,
                    $options:'i'
                },
                description:{
                    $regex:text,
                    $options:'i'
                }
            }
        ]
    }
    const sortallowed=["description","title","views","duration","createdAt","updatedAt"]
    const sortTypeAllowed=["des","asc"]
    if(!sortBy.includes(sortallowed)){
        throw new ApiError(400, "invalid sort")
    }
    if(!sortType.includes(sortTypeAllowed)){
        throw new ApiError(400,"invalid sort type")
    }
    const sorting={}
   
    sorting[sortBy]=sortType==="asc"?1:-1 

    const pagevalue=parseInt(page,10) || 1; 
    const limitvalue=parseInt(limit,10)|| 10;
    
    const video= await Video.aggregate([
        {
            $match:filter
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        project:{
                            fullname:1,
                            avatar:1,
                            username:1
                        }
                    }
                    
                ]

            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        },
        {
            $sort:sorting
        },
        {
            $skip:(pagevalue-1)*limitvalue
        },
        {
            $limit:limitvalue
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,video,"videos found"))
})

const publishAVideo = asynchandler(async (req, res) => {
    const { title, description} = req.body
   
    if(!(title|| description)){
        throw new ApiError(400,"title and description must be given")
    }
    if(title.length < 10 || title.length >100){
        throw new ApiError(400,"title length should be between 5 and 100 words")
    }
    const videoLocalPath=req.files?.videoFile[0].path
    const thumbnailLocalPath=req.files?.thumbnail[0].path

    if(!videoLocalPath){
        throw new ApiError(400,"video File is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail file is required")
    }
    const thumbnail= await uploadOnCloudinary(thumbnailLocalPath)
    const videoFile=await uploadOnCloudinary(videoLocalPath)

    const video= await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        title,
        description,
        duration:videoFile.duration,
        isPublished:true,
        owner:req.user._id    

    })
    if(!video){
        throw new ApiError(400,"something went wrong while creating teh video")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,video,"video is uploaded sucessfully"))



})

const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!mongoose.Types.ObjectId.isValid(videoId)){
       throw new ApiError(404,"invalid video Id")
    }

    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"such video does not exists")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,video,"video fetched sucessfully"))
})

const updateVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"no video id given")
    }
    const video =await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"no such video exists")
    }

    if(!req.user||!req.user._id){
        throw new ApiError(401,"athentication is required")
    }
    if(video.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"you are not allowed to change ")
    }
    const {title,description}=req.body
    const thumbnaillocalPath=req.file?.path
    if(!title && !description && !thumbnaillocalPath){
        throw new ApiError(404,"provide atleast title or thumbnail or description")
    }
    if(thumbnaillocalPath){
        const thumbnail=await uploadOnCloudinary(thumbnaillocalPath)
        video.thumbnail=thumbnail.url
    }
    if(title) video.title=title
    if(description) video.description=description
    
    await video.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,video,"video updated sucessfully"))



})

const deleteVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id")
    }
    if(!videoId){
        throw new ApiError(400,"no video id given")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"no such video exists")
    }
    if(!req.user||!req.user._id){
        throw new ApiError(401,"authentication required")
    }
    if(video.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"you are not allowed to delete the video")
    }
    await Video.findByIdAndDelete(videoId)
    return res
    .status(200)
    .json(new ApiResponse9200,{},"video deleted sucessfully")
})

const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id")
    }
    if(!videoId){
        throw new ApiError(400,"no video id given")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"no such video exists")
    }
    if(!req.user||!req.user._id){
        throw new ApiError(401,"authentication required")
    }
    if(video.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"you are not allowed to change the video status")
    }
    video.isPublished=!video.isPublished
    const update=await video.save()
    if(!update){
        throw new ApiError(500,"somerthing went wrong")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{publishStatus:update.isPublished},"video status changed sucessfully"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
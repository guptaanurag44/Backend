import { asynchandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens=async(userId)=>{

        const user=await User.findById(userId)
        if (!user) {
            throw new Error("User not found")
        }
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false}) //save without validation if true then all ferilds will be required for saving user like password etc
        return {accessToken, refreshToken}

}
const registerUser=asynchandler(async (req,res)=>{
    //get user details from frontend
    // validation - not empty
    // check if user already exists
    // check for images and check for avatar
    //upload them to cloudinary
    // create user object - crete entry in db
    // remove password and refresh token field from response mongo db me sab kuch aajata hai 
    // check for user creation
    // return res


    const {fullName,email,username,password}=req.body
    console.log("email: ",email)

    // if(fullName===""){
    //     throw new ApiError(400,"fullname is required")
    // }
    if(
        [fullName,email,username,password].some((field)=>{
            return field?.trim()===""})
    ){
        throw new ApiError(400,"All feilds are compulsory")
    }
    const existeduser=await User.findOne({
    $or:[{username},{email}]
})
    if(existeduser){
        throw new ApiError(409,"username or email already exists")
    } 
    //acessing files multer gives .files
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required ")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar file is equired ")
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering user")
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Sucessfully")
    )
})

const loginUser= asynchandler(async(req,res)=>{
    // req body => data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send to user via cookie

    const {email,username,password}= req.body

    if(!(username || email)){
        throw new ApiError(404,"username or email is required")
    }

    const user=await User.findOne({
        $or:[{username},{email}]   //dono me se kisi ek ke base pr mil gaya 
    })
    if(!user){
        throw new ApiError(404,"user does not exists")
    }
    const ispasswordvalid=await user.isPasswordCorrect(password)  //User nhi user
    if(!ispasswordvalid){
        throw new ApiError(401,"invalid password ")
    }
    const {accessToken ,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    // ab user me to empty tha acces and refresh token so put it there

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")  //logged in user will not get password and these
    const options={
        httpOnly:true,  //prevents cookie modification from frontend
        secure:true
    }
    //now sending response
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
             {  //data feild
                user:loggedInUser,accessToken,refreshToken  //alag se isliye bhej rhe hai taki local storage me bhi savbe kr ske user
            },
            "User logged in "
        )
    )
})

const logoutUser=asynchandler(async(req,res)=>{f
    //cookie clear
    // reset access and refresh token
    // how to get user user.findone or find by id will not work use req.user from auth middleware
    User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken:undefined
        }
    },{
        
        new:true
        
    })

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options) //options bhi pass krna hota hai
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{},"user logged out"))
})

const changeCurrentPassword=asynchandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user = await User.findById(req.user?._idid)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,"invalid old password")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false}) //ek hook chalega before save
    return res
    .status(200)
    .json(new ApiResponse(200,{},"password changed succesfully"))
})

const getCurrentUser=asynchandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"current user fetched succsfully")
})

const updateAccountDetails=asynchandler(async(req,res)=>{
    const {fullName,email}=req.body

    if(!fullName || !email){
        throw new ApiError(400," required feilds")
    }
    const user=User.findByIdandUpdate(
        req.user?._idid,
    {
        $set:{
            fullName:fullName,
            email
        }
    },{new :true}).select("-password")   //new true helps returning u[dated details]

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated sucessfully"))
})

const updateAvatar=asynchandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path  //directly isko bhi db sme save kara skte hai without cloudinary

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }
    const avatar= await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"error while uploading")
    }

    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    )
    return res.
    status(200)
    .json( new ApiResponse(200,user,"cover image updated"))
})

const updateCoverImage=asynchandler(async(req,res)=>{
    const coverLocalPath=req.file?.path
    if(!coverLocalPath){
        throw new ApiError(400,"Cover file is missing")
    }
    const coverImage=await uploadOnCloudinary(coverLocalPath)
    if(!coverImage){
        throw new ApiError(400,"error while uploading")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    )
    return res
    .status(200)
    .json(new ApiResponse(200,user,"cover image updated sucessfully"))
})

const getUserChannelProfile=asynchandler(async(req,res)=>{
    //channel ki profile url se milegi so req.params
    const {username}=req.params
    if(!username?.trim){
        throw new ApiError(400,"Username is missing")
    }

    const channel =await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptionschemas",
                localField:_id,
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptionschemas",
                localField:_id,
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"subscribers"]},  //is user present in subsccriber
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            //values with 1 will pass on
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                isSubscribed:1,
                email:1,
                avatar:1,
                coverImage:1

            }
        }
    ])
    if(!channel?.length){
        throw new ApiError(404,"channel does not exists")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"user channel details fetched sucessfully")
    )
})

const getwatchHistory=asynchandler(async(req,res)=>{
    const uaer=await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1

                                    }
                                },
                                {
                                    $addFields:{
                                        //to overwrite existing
                                        owner:{
                                            $first:"$owner"
                                        }
                                    }
                                }

                            ]
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory,"watch history fetched")
    )
})
export {getwatchHistory,getUserChannelProfile,registerUser,loginUser,logoutUser,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateAvatar,updateCoverImage}
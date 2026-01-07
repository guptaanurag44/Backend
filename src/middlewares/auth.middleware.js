import { ApiError } from "../utils/ApiError.js"
import { asynchandler } from "../utils/asynchandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

//will verify wheater user is there or not

export const verifyJWT= asynchandler(async(req,res,next)=>{
try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiError(401, "Unauthorized user")
        }
        const decodedtoken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user =await User.findById(decodedtoken?._id).select("-password -refreshToekn")  //see ujser model file to see name
        if(!user){
            throw new ApiError(401,"invalid Acess Token ")
        }    
        req.user=user
        next()
} catch (error) {
    throw new ApiError(401,"invalid access token")
}
})
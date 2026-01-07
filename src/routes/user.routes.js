import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getwatchHistory, loginUser, logoutUser, registerUser, updateAccountDetails, updateAvatar, updateCoverImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verify } from "jsonwebtoken";
const router = Router()

router.route("/register").post(
    upload.fields([{
        name:"avatar",
        maxCount:1
    },{
        name:"coverImage",
        maxCount:1
    }]),
    registerUser)
router.route('/login').post(loginUser)

router.route('/logout').post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAcessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getwatchHistory )
export default router 
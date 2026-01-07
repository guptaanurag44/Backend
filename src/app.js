import express from "express"
import cookieParser from "cookie-parser"  //server se user ki cookies acess kr pau aur use kr pau
import cors from "cors"
const app= express()

app.use(cors({
    origin:process.env.CORS_ORIGIN
}))
app.use(express.json({
    limit:"16kb"
}))

//for url data
app.use(express.urlencoded({extended:true,limit:"16kb"}) ) //extended means objects me ibjects de skte hai
app.use(express.static("public"))
app.use(cookieParser())

// routes import

import userRouter from './routes/user.routes.js'

// routes declaration 
app.use("/api/v1/users",userRouter)
export {app}
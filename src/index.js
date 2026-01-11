// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import {app} from "./app.js"
dotenv.config({
    path:'./.env'
})
// import express from "express";
import connectDb from "./db/index.js";
//const app=express()

connectDb()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at port ${process.env.PORT} `)
    })
})
.catch((err)=>{
    console.log("connection failed")
})






//use iffe for connecting db

/*
;(async ()=>{
    try{
        await mongoose.connect('mongodb+srv://guptaanuragyt:Anurag44@anurag.pimau.mongodb.net')
        app.on("error",(error)=>{
            console.log("ERROR")
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    }
    catch(error){
        console.error("ERROR",error)
        throw error
    }
})()
*/
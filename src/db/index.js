import mongoose from "mongoose"
import { DB_Name } from "../constants.js"

console.log("Mongo URL:", process.env.MONGODB_URL)
const connectDb=async ()=>{
    try{
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`)
        console.log(`\n Mongo connected DB:HOST ${connectionInstance.connection.host }`)
    }
    catch(error){
        console.log("Mongo db connection error ",error)
        process.exit(1) //node gives this to
    }
}
export default connectDb
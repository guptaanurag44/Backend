import mongoose, {Schema, schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId, //one who is subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, //to whom it is subscribing
        ref:"User"
    }
},{
    timestamps:true
})

export const SubscriptionSchema=mongoose.model("SubscriptionSchema",subscriptionSchema)
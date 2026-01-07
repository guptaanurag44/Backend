import { use } from "react"

const userSchema= new mongoose.Schema() //takes an object 

//We use mongoose.Schema() because MongoDB itself does NOT understand rules, but Mongoose adds rules, validation, and behavior on top of a plain object.
//mongoose.Schema() converts that object into a special schema object with powers
//mongoose.Schema():
//reads your object
//wraps it with logic
//turns it into a database-aware blueprint



//You can export the schema, but only the model can perform database operations — that’s why we export the model, not just the schema.
export const User=mongoose.model("User",userSchema) //will make users in db lowercase and plural


//This field stores a User’s _id and ref: 'User' tells Mongoose which model that ID belongs to.
createdby:{
    type:mongoose.Schema.Types.ObjectId
    ref:User  //this is name given in model not variable name

}
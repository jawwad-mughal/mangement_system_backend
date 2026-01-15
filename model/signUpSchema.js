import mongoose from 'mongoose'

const signUpSchema = new mongoose.Schema({
   name: {
    type: String,
    require: true,
   },
   email: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
   },
   password: {
    type: String,
    require: true,
   },
   refreshToken: { 
    type: String, 
    default: "" 
   } 
})
export const createAdmin = mongoose.model("createAdmins", signUpSchema)
import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
    name: {
        type:String,
        required:[true, "Please enter your name"],
        maxLength:[30, "Name should not exceed 30 characters"],
        minLength:[2, "Name should not less than 2 character"]
    },
    email: {
        type:String,
        required:[true, "Please enter your email"],
        unique:true,
        validate:[validator.isEmail,"Please enter a valid email"]
    },
    password: {
        type:String,
        required:[true, "Please enter a password"],
        minLength:[8, "Password should not exceed 8 characters"],
        select:false
    },
    avatar: {
        public_id: {
            type:String
        },
        url: {
            type:String
        }
    },
    createdAt: {
        type:Date,
        default:Date.now 
    }
});

UserSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcryptjs.hash(this.password, 10);
  
});

//JWT Token
UserSchema.methods.getJWTToken = function (){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    });
}

//Compare Password
UserSchema.methods.comparePassword = async function(enteredPassword){
    return await bcryptjs.compare(enteredPassword, this.password);
}

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
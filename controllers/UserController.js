import User from "../models/UserModel.js";
import ErrorHandler from "../utils/errorhandler.js";
import catchAsyncErrors from "../utils/catchAsyncErrors.js";
import sendToken from "../utils/jwttoken.js";
import cloudinary from "cloudinary";

//Register a user
export const registerUser = catchAsyncErrors(async(req,res,next) => {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width:150,
        crop:"scale",
    });

    const {name, email, password} = req.body;
    
    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },

    });

   sendToken(user,201,res);
});

//Login a user
export const loginUser = catchAsyncErrors(async(req,res,next) => {
    const { email, password } = req.body;

    //Checkin if user has given email and password both
    if(!email || !password){
        return next(new ErrorHandler("Please enter email and pasword", 400));
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    sendToken(user, 200, res);
});

//Logout a user
export const logout = catchAsyncErrors(async(req,res,next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly:true
    });

    res.status(200).json({
        success:true,
        message:"Logged Out"
    });
});

//Get All Users
export const allUsers = catchAsyncErrors(async(req,res,next) => {
    const keyword = req.query.search
    ? {
        $or: [
            { name: {$regex: req.query.search, $options: "i"} },
            { email: {$regex: req.query.search, $options: "i"} },
        ],
      }
    : {};
    const users = await User.find(keyword).find({_id: { $ne: req.user._id } });
    res.send(users);
});

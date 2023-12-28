import ErrorHandler from "./errorhandler.js";

export default (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Wrong Mongodb Id Error
    if(err.name === "CastError"){
        const message = `Resource not found. InvalidId: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    //Mongoose Duplicate Key Error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message,400);
    }
    
    //Wrong JWT Token Error
    if(err.name === "JsonWebTokenError"){
        const message = `Json web token is invalid, try again`;
        err = new ErrorHandler(message,400);
    }

    //JWT Expire Error
    if(err.name === "TokenExpireError"){
        const message = `Json web token is expired, try again`;
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })

}